"""
=============================================================================
CareFlow AI — FastAPI Clinical Validation & Report Intelligence Service
=============================================================================
File: api.py

Endpoints:
    GET  /api/health         - Service health and architecture status
    POST /api/validate       - Validates structured CBC parameter payload
    POST /api/parse-text     - Parses raw OCR text lines and runs validation
    POST /api/upload-report  - Secure upload handler with magic-byte validation

Safety & Security:
    - Never leaks internal stack traces or server file paths
    - File upload inspection: magic bytes (signatures), extension, and size limits
    - Path traversal prevention on filenames
    - Non-diagnostic educational boundary enforced across all responses
=============================================================================
"""

import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Ensure ml directory is on sys.path
ml_dir = Path(__file__).resolve().parent / "ml"
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))

from cbc_schema import CBCRecord, CBCValidationResult, ValidationStatus
from cbc_validator import PARAMETER_CONSTRAINTS, validate_cbc_record
from ocr.report_parser import parse_cbc_report_text, ParsedCBCReport


# =============================================================================
# APPLICATION DEFINITION & CORS
# =============================================================================

app = FastAPI(
    title="CareFlow AI Clinical Intelligence API",
    version="1.0.0",
    description=(
        "Non-diagnostic healthcare intelligence backend providing structured "
        "Complete Blood Count (CBC) validation, OCR text parsing, and outlier analysis."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# CONSTANTS & SECURITY LIMITS
# =============================================================================

MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

MAGIC_SIGNATURES = {
    b"%PDF-": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
}

DISCLAIMER_TEXT = (
    "CareFlow AI provides informational and health-literacy explanations only. "
    "It is not a diagnostic tool and does not replace consultation with a licensed "
    "physician. Standard Complete Blood Count tests cannot diagnose specific viral "
    "infections such as dengue on their own without dedicated serological or PCR tests."
)


# =============================================================================
# PYDANTIC SCHEMAS
# =============================================================================

class CBCValidateRequest(BaseModel):
    age: Optional[float] = Field(None, description="Patient age in years")
    gender: Optional[str] = Field(None, description="Patient sex/gender category")
    hemoglobin_g_dl: Optional[float] = Field(None, description="Hemoglobin (g/dL)")
    wbc_count: Optional[float] = Field(None, description="Total WBC count (/mcL)")
    platelet_count: Optional[float] = Field(None, description="Total Platelet count (/mcL)")
    platelet_distribution_width: Optional[float] = Field(None, description="PDW (%)")
    rbc_count: Optional[float] = Field(None, description="RBC count (million/mcL)")
    hematocrit: Optional[float] = Field(None, description="Hematocrit / PCV (%)")
    mcv: Optional[float] = Field(None, description="MCV (fL)")
    mch: Optional[float] = Field(None, description="MCH (pg)")
    mchc: Optional[float] = Field(None, description="MCHC (g/dL)")
    rdw_cv: Optional[float] = Field(None, description="RDW-CV (%)")
    neutrophils: Optional[float] = Field(None, description="Neutrophils (%)")
    lymphocytes: Optional[float] = Field(None, description="Lymphocytes (%)")
    monocytes: Optional[float] = Field(None, description="Monocytes (%)")
    eosinophils: Optional[float] = Field(None, description="Eosinophils (%)")
    basophils: Optional[float] = Field(None, description="Basophils (%)")
    mpv: Optional[float] = Field(None, description="MPV (fL)")


class ParseTextRequest(BaseModel):
    raw_text: str = Field(..., min_length=1, max_length=50000, description="Raw OCR multi-line text from lab report")


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def sanitize_filename(filename: str) -> str:
    """Strips path traversal elements, control characters, and dangerous characters."""
    clean = os.path.basename(filename)
    clean = re.sub(r"[^\w\.\-_]", "_", clean)
    return clean[:128]


def verify_file_magic(header: bytes) -> Optional[str]:
    """Inspects leading bytes to verify genuine document file signatures."""
    for sig, mime in MAGIC_SIGNATURES.items():
        if header.startswith(sig):
            return mime
    return None


# =============================================================================
# API ROUTES
# =============================================================================

@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    """Returns platform operational health, supported parameters, and safety notice."""
    return {
        "status": "healthy",
        "service": "CareFlow AI Clinical Intelligence API",
        "supported_cbc_parameters": len(PARAMETER_CONSTRAINTS),
        "supported_languages": ["en", "hi", "es", "fr", "de", "bn"],
        "non_diagnostic_boundary": True,
        "disclaimer": DISCLAIMER_TEXT,
    }


@app.post("/api/validate")
def validate_record(payload: CBCValidateRequest) -> JSONResponse:
    """
    Validates a CBC parameter record against biological bounds, statistical IQR
    fences, and hematological consistency rules (Differential sum, Rule of Three).
    Returns HTTP 422 if values are corrupted/invalid, or HTTP 200 for valid / outlier review.
    """
    try:
        data = payload.model_dump(exclude_unset=True)
        record = CBCRecord.from_dict(data)
        validation_result = validate_cbc_record(record)
        response_dict = validation_result.to_dict()
        response_dict["disclaimer"] = DISCLAIMER_TEXT

        if validation_result.overall_status == ValidationStatus.INVALID:
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content=response_dict,
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_dict,
        )

    except Exception as exc:
        # Mask internal errors safely without leaking stack traces
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "is_valid": False,
                "overall_status": "ERROR",
                "summary_messages": ["An unexpected error occurred during clinical validation."],
                "disclaimer": DISCLAIMER_TEXT,
            },
        )


@app.post("/api/parse-text")
def parse_ocr_text(payload: ParseTextRequest) -> JSONResponse:
    """
    Parses multi-line OCR text, extracts all 16 CBC parameters and demographics,
    and runs the clinical validation firewall over the extracted data.
    """
    try:
        parsed_report: ParsedCBCReport = parse_cbc_report_text(payload.raw_text)
        cbc_record: CBCRecord = parsed_report.to_cbc_record()
        validation_result: CBCValidationResult = validate_cbc_record(cbc_record)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "report": parsed_report.to_dict(),
                "validation": validation_result.to_dict(),
                "disclaimer": DISCLAIMER_TEXT,
            },
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Failed to parse OCR report text.",
                "disclaimer": DISCLAIMER_TEXT,
            },
        )


@app.post("/api/upload-report")
def upload_report(file: UploadFile = File(...)) -> JSONResponse:
    """
    Validates uploaded medical report document (MIME, extension, size limit,
    magic byte signature) to prevent malicious upload or server resource exhaustion.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File upload missing filename.",
        )

    clean_name = sanitize_filename(file.filename)
    ext = Path(clean_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: PDF, JPG, PNG.",
        )

    # Read and inspect initial bytes for magic signature
    content = file.file.read(MAX_UPLOAD_SIZE_BYTES + 1024)
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 15MB.",
        )

    detected_mime = verify_file_magic(content[:16])
    if not detected_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content signature mismatch. The file is corrupted or not a valid PDF/JPEG/PNG.",
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "filename": clean_name,
            "detected_mime": detected_mime,
            "size_bytes": len(content),
            "status": "Document verified and sanitized successfully",
            "disclaimer": DISCLAIMER_TEXT,
        },
    )
