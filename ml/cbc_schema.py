"""
=============================================================================
CareFlow AI - Structured CBC Data Schema
=============================================================================
File: ml/cbc_schema.py

Purpose:
    Defines clear, typed data structures for Complete Blood Count (CBC)
    parameters extracted from patient laboratory reports (e.g. via OCR).

Pipeline Context:
    CBC Report Image/PDF
    -> OCR
    -> Structured CBC values (defined here)
    -> Data validation (cbc_validator.py)
    -> Reference-range comparison
    -> Patient-friendly explanation

Important Architecture Notes:
    - This schema contains ONLY standard observational laboratory fields.
    - It does NOT include any disease diagnostic labels (e.g. no dengue_label).
    - It does NOT hardcode universal clinical reference ranges; laboratory
      reference intervals vary by machine, reagent, and lab, and will be
      extracted directly from the patient's report in subsequent pipeline stages.
=============================================================================
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class ValidationStatus(str, Enum):
    """
    Standard validation status codes for CBC field-level and record-level checks.
    """
    VALID = "VALID"                   # Value is numeric, positive, and statistically plausible
    MISSING = "MISSING"               # Value was not detected, empty, or None (e.g. omitted in report)
    INVALID = "INVALID"               # Value is non-numeric, negative, or physically impossible
    OUTLIER_REVIEW = "OUTLIER_REVIEW" # Value is statistically unusual; requires review without auto-deletion


@dataclass
class CBCRecord:
    """
    Data structure representing a single patient's extracted Complete Blood Count (CBC).

    Attributes:
        age: Patient age in years (float or int). None if omitted from report.
        gender: Patient sex/gender category ('Male', 'Female', 'Child', etc.).
        hemoglobin_g_dl: Hemoglobin concentration in g/dL.
        wbc_count: Total White Blood Cell count (cells/mcL or /uL).
        platelet_count: Platelet count (cells/mcL or /uL).
        platelet_distribution_width: Platelet Distribution Width (PDW in % or fL).
    """
    age: Optional[float] = None
    gender: Optional[str] = None
    hemoglobin_g_dl: Optional[float] = None
    wbc_count: Optional[float] = None
    platelet_count: Optional[float] = None
    platelet_distribution_width: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert the CBCRecord instance into a standard Python dictionary."""
        return {
            "age": self.age,
            "gender": self.gender,
            "hemoglobin_g_dl": self.hemoglobin_g_dl,
            "wbc_count": self.wbc_count,
            "platelet_count": self.platelet_count,
            "platelet_distribution_width": self.platelet_distribution_width,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CBCRecord":
        """Construct a CBCRecord instance safely from a dictionary."""
        return cls(
            age=data.get("age"),
            gender=data.get("gender"),
            hemoglobin_g_dl=data.get("hemoglobin_g_dl"),
            wbc_count=data.get("wbc_count"),
            platelet_count=data.get("platelet_count"),
            platelet_distribution_width=data.get("platelet_distribution_width"),
        )


@dataclass
class FieldValidationResult:
    """
    Detailed validation outcome for a single CBC parameter.

    Attributes:
        field_name: The name of the CBC parameter (e.g. 'hemoglobin_g_dl').
        status: ValidationStatus enum (VALID, MISSING, INVALID, OUTLIER_REVIEW).
        raw_value: The unparsed or original input value.
        cleaned_value: The parsed float value if numeric, or None if invalid/missing.
        message: Human-readable explanation of why the status was assigned.
    """
    field_name: str
    status: ValidationStatus
    raw_value: Any
    cleaned_value: Optional[float] = None
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        """Serialize field result to a dictionary."""
        return {
            "field_name": self.field_name,
            "status": self.status.value,
            "raw_value": self.raw_value,
            "cleaned_value": self.cleaned_value,
            "message": self.message,
        }


@dataclass
class CBCValidationResult:
    """
    Comprehensive record-level validation report for all CBC parameters.

    Attributes:
        is_valid: True if all present values are syntactically valid (no INVALID errors).
        overall_status: The highest-severity status across all fields.
        field_results: Dictionary mapping field name to FieldValidationResult.
        summary_messages: List of human-readable findings for the patient or provider.
    """
    is_valid: bool
    overall_status: ValidationStatus
    field_results: Dict[str, FieldValidationResult] = field(default_factory=dict)
    summary_messages: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize full record validation result to a dictionary (ready for JSON / FastAPI)."""
        return {
            "is_valid": self.is_valid,
            "overall_status": self.overall_status.value,
            "field_results": {
                name: res.to_dict() for name, res in self.field_results.items()
            },
            "summary_messages": self.summary_messages,
        }
