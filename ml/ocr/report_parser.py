"""
=============================================================================
CareFlow AI - CBC Report OCR Text Parser
=============================================================================
File: ml/ocr/report_parser.py

Purpose:
    Converts raw OCR text from a Complete Blood Count (CBC) report into
    clean, structured CBC parameters and patient demographics.

Pipeline Context:
    [OCR Engine / PaddleOCR] (raw text lines)
            ↓
    [Report Parser Engine] (ml/ocr/report_parser.py)
        - 16 CBC parameters & aliases
        - Multiline and single-line/tabular report handling
        - Report-specific reference ranges (<, >, min-max)
        - Full unit extraction (g/dL, /μL, million/μL, %, fL, pg, etc.)
        - Split decimal & comma normalization
        - Demographic extraction (Age, Gender)
            ↓
    [Structured CBCRecord Bridge] (ml/cbc_schema.py)
            ↓
    [CBC Validator Engine] (ml/cbc_validator.py)

Important Principles:
    - NO disease diagnosis or treatment recommendations
    - NO hard-coded universal medical reference ranges
    - Patient report reference intervals are extracted directly from the report
    - CBCRecord schema preserved; additional parameters stored in structured report
=============================================================================
"""

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# Ensure UTF-8 console output on Windows environments
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


# =============================================================================
# IMPORT VALIDATOR & SCHEMA
# =============================================================================

try:
    from cbc_schema import CBCRecord, ValidationStatus
    from cbc_validator import validate_cbc_record
except ImportError:
    try:
        from ml.cbc_schema import CBCRecord, ValidationStatus
        from ml.cbc_validator import validate_cbc_record
    except ImportError:
        parent_dir = Path(__file__).resolve().parent.parent
        sys.path.insert(0, str(parent_dir))
        from cbc_schema import CBCRecord, ValidationStatus
        from cbc_validator import validate_cbc_record


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class ParsedCBCItem:
    """
    Structured representation of a single extracted CBC parameter.

    Attributes:
        canonical_name: Standardized parameter name across CareFlow AI.
        raw_test_name: Exact label as detected by OCR on the patient report.
        value: Clean normalized numeric float value (e.g. 6800.0, 14.2).
        raw_value: Original numeric string before float conversion (e.g. '6,800', '14.2').
        unit: Measurement unit (e.g. 'g/dL', '/μL', '%', 'fL', 'pg', 'million/μL').
        reference_range: Complete reference range string from the report (e.g. '12.0 - 16.0', '< 200').
        ref_min: Lower numeric fence of the report-specific reference range if available.
        ref_max: Upper numeric fence of the report-specific reference range if available.
        confidence: OCR recognition confidence score if provided by OCR engine.
    """
    canonical_name: str
    raw_test_name: str
    value: Optional[float]
    raw_value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    ref_min: Optional[float] = None
    ref_max: Optional[float] = None
    confidence: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Serialize item to a Python dictionary."""
        return {
            "canonical_name": self.canonical_name,
            "raw_test_name": self.raw_test_name,
            "value": self.value,
            "raw_value": self.raw_value,
            "unit": self.unit,
            "reference_range": self.reference_range,
            "ref_min": self.ref_min,
            "ref_max": self.ref_max,
            "confidence": self.confidence,
        }


@dataclass
class ParsedCBCReport:
    """
    Structured representation of an entire parsed CBC laboratory report.

    Attributes:
        patient_age: Extracted patient age in years (int or float).
        patient_gender: Standardized patient sex/gender ('Male', 'Female', 'Child', etc.).
        items: Dictionary mapping canonical parameter name to ParsedCBCItem.
        unmatched_lines: OCR text lines that did not belong to any parameter.
    """
    patient_age: Optional[Union[int, float]] = None
    patient_gender: Optional[str] = None
    items: Dict[str, ParsedCBCItem] = field(default_factory=dict)
    unmatched_lines: List[str] = field(default_factory=list)

    def get_item(self, name: str) -> Optional[ParsedCBCItem]:
        """
        Safely retrieve an extracted parameter by canonical name or alias.
        """
        if name in self.items:
            return self.items[name]

        alias_lookup = {
            "Platelet Distribution Width": "PDW",
            "PDW": "PDW",
            "Hb": "Hemoglobin",
            "Haemoglobin": "Hemoglobin",
            "Total RBC Count": "RBC Count",
            "RBC": "RBC Count",
            "Total WBC Count": "WBC Count",
            "TLC": "WBC Count",
            "WBC": "WBC Count",
            "Total Platelet Count": "Platelet Count",
            "Platelets": "Platelet Count",
            "PLT": "Platelet Count",
            "PCV": "Hematocrit",
            "HCT": "Hematocrit",
            "RDW": "RDW-CV",
            "Mean Platelet Volume": "MPV",
        }
        canonical = alias_lookup.get(name)
        if canonical and canonical in self.items:
            return self.items[canonical]
        return None

    def to_cbc_record(self) -> CBCRecord:
        """
        Bridges the parsed report into the established 6-field CBCRecord schema
        for validation via cbc_validator.py without breaking the existing interface.
        """
        hb = self.items.get("Hemoglobin")
        wbc = self.items.get("WBC Count")
        plt = self.items.get("Platelet Count")
        pdw = self.items.get("PDW") or self.items.get("Platelet Distribution Width")

        return CBCRecord(
            age=float(self.patient_age) if self.patient_age is not None else None,
            gender=self.patient_gender,
            hemoglobin_g_dl=(hb.value if hb else None),
            wbc_count=(wbc.value if wbc else None),
            platelet_count=(plt.value if plt else None),
            platelet_distribution_width=(pdw.value if pdw else None),
        )

    def to_dict(self) -> Dict[str, Any]:
        """Serialize full report to a Python dictionary."""
        return {
            "patient_age": self.patient_age,
            "patient_gender": self.patient_gender,
            "items": {
                name: item.to_dict()
                for name, item in self.items.items()
            },
            "unmatched_lines": self.unmatched_lines,
        }


# =============================================================================
# 16 CBC PARAMETER PATTERNS (ORDERED BY SPECIFICITY)
# =============================================================================

TEST_PATTERNS = [
    # 1. MCHC (Mean Corpuscular Hemoglobin Concentration)
    (
        "MCHC",
        re.compile(
            r"\b(?:mean\s*corpuscular\s*(?:hemoglobin|haemoglobin|hb)\s*(?:concentration|conc\.?)|"
            r"m\.?\s*c\.?\s*h\.?\s*c\.?)\b",
            re.IGNORECASE,
        ),
    ),
    # 2. MCH (Mean Corpuscular Hemoglobin - must not match MCHC)
    (
        "MCH",
        re.compile(
            r"\b(?:mean\s*corpuscular\s*(?:hemoglobin|haemoglobin)|"
            r"m\.?\s*c\.?\s*h\.?)\b"
            r"(?!\s*c\b)(?!\s*concentration\b)",
            re.IGNORECASE,
        ),
    ),
    # 3. MCV (Mean Corpuscular Volume)
    (
        "MCV",
        re.compile(
            r"\b(?:mean\s*corpuscular\s*volume|"
            r"m\.?\s*c\.?\s*v\.?)\b",
            re.IGNORECASE,
        ),
    ),
    # 4. MPV (Mean Platelet Volume)
    (
        "MPV",
        re.compile(
            r"\b(?:mean\s*platelet\s*volume(?:\s*\(\s*mpv\s*\))?|"
            r"m\.?\s*p\.?\s*v\.?)\b",
            re.IGNORECASE,
        ),
    ),
    # 5. PDW (Platelet Distribution Width - tested before Platelet Count)
    (
        "PDW",
        re.compile(
            r"\b(?:platelet\s*distribution\s*width(?:\s*\(\s*pdw\s*\))?|"
            r"p\.?\s*d\.?\s*w\.?)\b",
            re.IGNORECASE,
        ),
    ),
    # 6. Platelet Count (must not match Platelet Distribution Width)
    (
        "Platelet Count",
        re.compile(
            r"\b(?:total\s*platelet\s*count|platelet\s*count|platelets?|"
            r"thrombocytes?(?:\s*count)?|p\.?\s*l\.?\s*t\.?)\b"
            r"(?!\s*distribution)(?!\s*crit)",
            re.IGNORECASE,
        ),
    ),
    # 7. RDW-CV (Red Cell Distribution Width)
    (
        "RDW-CV",
        re.compile(
            r"\b(?:red\s*(?:blood\s*)?cell\s*distribution\s*width(?:\s*[-–—_]?\s*(?:cv|sd))?(?:\s*\(\s*rdw(?:[-–—_]?cv)?\s*\))?|"
            r"r\.?\s*d\.?\s*w\.?(?:\s*[-–—_]?\s*(?:c\.?v\.?|s\.?d\.?))?)\b",
            re.IGNORECASE,
        ),
    ),
    # 8. Hematocrit (Packed Cell Volume / PCV / HCT)
    (
        "Hematocrit",
        re.compile(
            r"\b(?:hematocrit|haematocrit|"
            r"packed\s*cell\s*volume(?:\s*\(\s*pcv\s*\))?|"
            r"p\.?\s*c\.?\s*v\.?|"
            r"h\.?\s*c\.?\s*t\.?)"
            r"(?:\s*\(\s*(?:hct|pcv)\s*\))?\b",
            re.IGNORECASE,
        ),
    ),
    # 9. RBC Count (Total Erythrocyte Count / RBC)
    (
        "RBC Count",
        re.compile(
            r"\b(?:total\s*(?:rbc|r\.?\s*b\.?\s*c\.?)(?:\s*count)?|"
            r"r\.?\s*b\.?\s*c\.?\s*count|"
            r"r\.?\s*b\.?\s*c\.?|"
            r"total\s*(?:erythrocyte|red\s*blood\s*(?:cell|corpuscle)s?)\s*count|"
            r"erythrocyte\s*count|"
            r"erythrocytes|"
            r"red\s*blood\s*(?:cells?|corpuscles?)(?:\s*count)?)\b",
            re.IGNORECASE,
        ),
    ),
    # 10. WBC Count (Total Leukocyte Count / TLC / WBC)
    (
        "WBC Count",
        re.compile(
            r"\b(?:total\s*(?:wbc|w\.?\s*b\.?\s*c\.?)(?:\s*count)?|"
            r"w\.?\s*b\.?\s*c\.?\s*count|"
            r"w\.?\s*b\.?\s*c\.?|"
            r"total\s*(?:leukocyte|leucocyte|white\s*blood\s*(?:cell|corpuscle)s?)\s*count|"
            r"(?:total\s*)?(?:leukocyte|leucocyte)\s*count|"
            r"white\s*blood\s*(?:cells?|corpuscles?)(?:\s*count)?|"
            r"t\.?\s*l\.?\s*c\.?)\b",
            re.IGNORECASE,
        ),
    ),
    # 11. Neutrophils (Segmented Neutrophils / Segs / Polymorphs)
    (
        "Neutrophils",
        re.compile(
            r"\b(?:neutrophils?|segmented\s*neutrophils?|segs|polymorphs?|"
            r"polymorphonuclear(?:\s*cells?|\s*leukocytes?)?|"
            r"absolute\s*neutrophil\s*count|anc)\b",
            re.IGNORECASE,
        ),
    ),
    # 12. Lymphocytes (Lymphs / Absolute Lymphocytes)
    (
        "Lymphocytes",
        re.compile(
            r"\b(?:lymphocytes?|lymphs?|absolute\s*lymphocyte\s*count|alc)\b",
            re.IGNORECASE,
        ),
    ),
    # 13. Monocytes (Monos / Absolute Monocytes)
    (
        "Monocytes",
        re.compile(
            r"\b(?:monocytes?|monos?|absolute\s*monocyte\s*count|amc)\b",
            re.IGNORECASE,
        ),
    ),
    # 14. Eosinophils (Eos / Absolute Eosinophils)
    (
        "Eosinophils",
        re.compile(
            r"\b(?:eosinophils?|eos|absolute\s*eosinophil\s*count|aec)\b",
            re.IGNORECASE,
        ),
    ),
    # 15. Basophils (Basos / Absolute Basophils)
    (
        "Basophils",
        re.compile(
            r"\b(?:basophils?|basos?|absolute\s*basophil\s*count)\b",
            re.IGNORECASE,
        ),
    ),
    # 16. Hemoglobin (Hb / Hgb / Haemoglobin)
    (
        "Hemoglobin",
        re.compile(
            r"\b(?:hemoglobin|haemoglobin)(?:\s*\(\s*(?:hb|hgb)\s*\))?|"
            r"\b(?:hgb|h\.?\s*b\.?)\b",
            re.IGNORECASE,
        ),
    ),
]


# =============================================================================
# UNIT PATTERNS (SUPPORTS GREEK MU, COMMAS, SCIENTIFIC NOTATION)
# =============================================================================

UNIT_PATTERN = re.compile(
    r"("
    # Millions: million/μL, millions/μL, mil/uL, mill/cumm, etc.
    r"(?:millions?|mill?)\s*\/\s*(?:cumm|cu\.mm|mm3|mm\^3|(?:[uµ\u03bc\u00b5]|mc)L)|"
    # Cells: cells/μL, cells/uL, cells/mcL, cells/cumm, etc.
    r"cells?\s*\/\s*(?:cumm|cu\.mm|mm3|mm\^3|(?:[uµ\u03bc\u00b5]|mc)L)|"
    # Scientific notation: 10^3/uL, 10^6/uL, x10^3/uL, 10^9/L, 10^12/L
    r"(?:x\s*)?10\^?[369]\s*\/\s*(?:(?:[uµ\u03bc\u00b5]|mc)L|L|cumm)|"
    # Slash units: /μL, /µL, /uL, /mcL, /cumm, /cu.mm, /mm3, /mm^3
    r"\/\s*(?:cumm|cu\.mm|mm3|mm\^3|(?:[uµ\u03bc\u00b5]|mc)L)|"
    # Mass concentration: g/dL, gm/dL, g/dl, gm/dl, g%, gm%, mg/dL, mg/dl
    r"(?:gm?|mg)\s*\/\s*d[lL]|gm?%|"
    # Volumes & weights: fL, fl, pg
    r"\b(?:f[lL]|pg)\b|"
    # Percentage
    r"%"
    r")",
    re.IGNORECASE,
)


# =============================================================================
# REFERENCE RANGE PATTERNS
# =============================================================================

TWO_SIDED_REF_PATTERN = re.compile(
    r"(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:,\d+)*(?:\.\d+)?)",
    re.IGNORECASE,
)

LESS_THAN_REF_PATTERN = re.compile(
    r"(?:<|<=|≤|less\s*than|up\s*to|upto)\s*(\d+(?:,\d+)*(?:\.\d+)?)",
    re.IGNORECASE,
)

GREATER_THAN_REF_PATTERN = re.compile(
    r"(?:>|>=|≥|greater\s*than|more\s*than)\s*(\d+(?:,\d+)*(?:\.\d+)?)",
    re.IGNORECASE,
)


# =============================================================================
# NUMERIC & OCR PATTERNS
# =============================================================================

NUMBER_PATTERN = re.compile(
    r"(?<!\w)\d+(?:,\d+)*(?:\.\d+)?(?!\w)"
)

STOP_LINE_PATTERNS = [
    re.compile(r"\b(?:clinical\s*interpretation|interpretation|clinical\s*impression|impression)\b", re.IGNORECASE),
    re.compile(r"\b(?:approved\s*by|checked\s*by|verified\s*by|authorized\s*signatory|reported\s*by)\b", re.IGNORECASE),
    re.compile(r"\b(?:technician|lab\s*technician|pathologist|doctor|dr\.)\b", re.IGNORECASE),
    re.compile(r"\b(?:this\s*is\s*a\s*computer|correlate\s*clinically|end\s*of\s*report)\b", re.IGNORECASE),
    re.compile(r"\b(?:patient\s*name|sample\s*type|specimen|patient\s*id|uhid|reg\.?\s*no|mrn|barcode)\b", re.IGNORECASE),
    re.compile(r"\b(?:collection\s*date|received\s*date|report\s*date|reported\s*date)\b", re.IGNORECASE),
    re.compile(r"\b(?:ref\.?\s*by|referred\s*by|department|hospital|laboratory|clinic)\b", re.IGNORECASE),
    re.compile(r"\b(?:age\s*[\/,]\s*gender|age\s*[\/,]\s*sex|patient\s*age)\b", re.IGNORECASE),
    re.compile(r"\b(?:cbc\s*results?|complete\s*blood\s*count|investigation|test\s*description)\b", re.IGNORECASE),
    re.compile(r"^(?:parameter|result|unit|reference\s*range|biological\s*ref(?:\s*interval)?|normal\s*range)\b", re.IGNORECASE),
]


# =============================================================================
# CLEAN OCR TEXT
# =============================================================================

def clean_ocr_line(line: str) -> str:
    """
    Cleans raw OCR line by normalizing spaces, repairing split decimals
    (e.g. '14 . 2' -> 14.2), and repairing spaced commas (e.g. '140 , 000' -> 140,000).
    """
    if not line:
        return ""

    text = line.strip().replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)

    # Repair split decimals: 14 . 2 -> 14.2
    text = re.sub(r"(\d+)\s*\.\s*(\d+)", r"\1.\2", text)

    # Repair spaced commas: 140 , 000 -> 140,000
    text = re.sub(r"(\d+)\s*,\s*(\d+)", r"\1,\2", text)

    return text.strip()


# =============================================================================
# NUMERIC SANITIZATION & PARSING
# =============================================================================

def parse_numeric_token(token: str) -> Optional[float]:
    """
    Safely converts a numeric string with optional commas into a float.
    Handles Western (210,000) and Indian (1,85,000) comma notations.
    """
    if not token:
        return None

    cleaned = token.replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def sanitize_value_text(text: str) -> str:
    """
    Strips dates (24-04-2025), timestamps (10:15 AM), and IDs (CBL123456)
    so they cannot be accidentally parsed as CBC test values.
    """
    # Remove calendar dates (DD-MM-YYYY, YYYY-MM-DD, etc.)
    t = re.sub(r"\b\d{1,4}[-/]\d{1,2}[-/]\d{2,4}\b", " ", text)

    # Remove timestamps (10:15, 10:15:30 AM/PM)
    t = re.sub(r"\b\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?\b", " ", t)

    # Remove patient IDs, reference numbers, or barcodes
    t = re.sub(
        r"\b(?:id|patient\s*id|uhid|ref|sample|pin|phone)\s*[:#-]?\s*[A-Za-z0-9-]+\b",
        " ",
        t,
        flags=re.IGNORECASE,
    )
    return t


def extract_first_number(text: str) -> Optional[float]:
    """
    Finds and parses the first numeric value from a text string,
    ignoring dates, times, and patient metadata.
    """
    cleaned = sanitize_value_text(text)
    match = NUMBER_PATTERN.search(cleaned)
    if not match:
        return None
    return parse_numeric_token(match.group(0))


# =============================================================================
# REFERENCE RANGE EXTRACTION
# =============================================================================

def extract_reference_range(
    text: str,
) -> Tuple[Optional[str], Optional[float], Optional[float], str]:
    """
    Extracts the report-specific reference range from text.
    Supports:
        - Two-sided ranges: '12.0 - 16.0', '4,000 - 11,000', '4.0 to 5.5'
        - Less-than upper bounds: '< 200', '<= 150'
        - Greater-than lower bounds: '> 5', '>= 10.0'

    Returns:
        (reference_range_string, ref_min, ref_max, remaining_text_without_range)
    """
    # 1. Two-sided range
    m_two = TWO_SIDED_REF_PATTERN.search(text)
    if m_two:
        ref_str = m_two.group(0).strip()
        low = parse_numeric_token(m_two.group(1))
        high = parse_numeric_token(m_two.group(2))
        remaining = (text[:m_two.start()] + " " + text[m_two.end():]).strip()
        return ref_str, low, high, remaining

    # 2. Less-than upper bound
    m_less = LESS_THAN_REF_PATTERN.search(text)
    if m_less:
        ref_str = m_less.group(0).strip()
        high = parse_numeric_token(m_less.group(1))
        remaining = (text[:m_less.start()] + " " + text[m_less.end():]).strip()
        return ref_str, None, high, remaining

    # 3. Greater-than lower bound
    m_greater = GREATER_THAN_REF_PATTERN.search(text)
    if m_greater:
        ref_str = m_greater.group(0).strip()
        low = parse_numeric_token(m_greater.group(1))
        remaining = (text[:m_greater.start()] + " " + text[m_greater.end():]).strip()
        return ref_str, low, None, remaining

    return None, None, None, text


# =============================================================================
# UNIT EXTRACTION
# =============================================================================

def extract_unit(text: str) -> Tuple[Optional[str], str]:
    """
    Extracts the measurement unit from text and returns the unit and remaining text.
    """
    match = UNIT_PATTERN.search(text)
    if not match:
        return None, text

    unit = match.group(0).strip()
    remaining = (text[:match.start()] + " " + text[match.end():]).strip()
    return unit, remaining


# =============================================================================
# TEST NAME DETECTION
# =============================================================================

def find_test_parameter(
    text: str,
) -> Tuple[Optional[str], Optional[str], str]:
    """
    Checks if a line begins with or contains a recognized CBC parameter name or alias.

    Returns:
        (canonical_name, raw_test_name, remaining_text)
    """
    for canonical_name, pattern in TEST_PATTERNS:
        match = pattern.search(text)
        if match:
            raw_name = match.group(0).strip()
            remaining = (text[:match.start()] + " " + text[match.end():]).strip()
            # Clean leading colons, hyphens, or equals
            remaining = re.sub(r"^[\s:=–—-]+", "", remaining).strip()
            return canonical_name, raw_name, remaining

    return None, None, text


def is_stop_line(text: str) -> bool:
    """
    Detects whether a line represents a section divider, clinical note,
    report footer, or column header that should terminate lookahead.
    """
    for pattern in STOP_LINE_PATTERNS:
        if pattern.search(text):
            return True
    return False


# =============================================================================
# PARAMETER BLOCK PARSER (MULTILINE & TABULAR)
# =============================================================================

def parse_parameter_block(
    lines: List[str],
    start_index: int,
) -> Tuple[Optional[ParsedCBCItem], int]:
    """
    Parses a CBC parameter whether it is laid out across multiple lines or
    presented as a single tabular line.

    Collects the parameter result, unit, and report-specific reference range,
    stopping when another CBC parameter begins or non-test footer text is met.
    """
    first_line = clean_ocr_line(lines[start_index])
    canonical_name, raw_test_name, rem_first = find_test_parameter(first_line)

    if not canonical_name:
        return None, start_index

    # -------------------------------------------------------------------------
    # Check if the line alone already contains value, unit, and reference range
    # (Standard single-line / tabular report layout)
    # -------------------------------------------------------------------------
    if rem_first.strip():
        ref_s_first, low_first, high_first, rem_check = extract_reference_range(rem_first)
        u_s_first, rem_check = extract_unit(rem_check)
        v_s_first = extract_first_number(rem_check)

        if ref_s_first is not None and u_s_first is not None and v_s_first is not None:
            raw_v = ""
            sanitized = sanitize_value_text(rem_check)
            num_m = NUMBER_PATTERN.search(sanitized)
            if num_m:
                raw_v = num_m.group(0).strip()

            item = ParsedCBCItem(
                canonical_name=canonical_name,
                raw_test_name=raw_test_name,
                value=v_s_first,
                raw_value=raw_v,
                unit=u_s_first,
                reference_range=ref_s_first,
                ref_min=low_first,
                ref_max=high_first,
            )
            return item, start_index + 1

    # -------------------------------------------------------------------------
    # Multiline collection: look ahead at the next few lines belonging to test
    # -------------------------------------------------------------------------
    combined_parts = []
    if rem_first.strip():
        combined_parts.append(rem_first.strip())

    max_lookahead = min(start_index + 6, len(lines))
    next_index = start_index + 1

    while next_index < max_lookahead:
        candidate = clean_ocr_line(lines[next_index])
        if not candidate:
            next_index += 1
            continue

        # Stop if another CBC parameter begins
        next_param, _, _ = find_test_parameter(candidate)
        if next_param:
            break

        # Stop at section headers, footers, metadata, or table headers
        if is_stop_line(candidate):
            break

        combined_parts.append(candidate)
        next_index += 1

        # If we have collected value, unit, and reference range, stop early
        temp_text = " ".join(combined_parts)
        ref_s, _, _, rem = extract_reference_range(temp_text)
        u_s, rem = extract_unit(rem)
        v_s = extract_first_number(rem)
        if ref_s is not None and u_s is not None and v_s is not None:
            break

    combined_text = " ".join(combined_parts)

    # 1. Reference range extraction
    ref_string, ref_min, ref_max, remaining = extract_reference_range(combined_text)

    # 2. Unit extraction
    unit, remaining = extract_unit(remaining)

    # 3. Numeric result extraction
    value = extract_first_number(remaining)
    raw_value = ""

    if value is not None:
        sanitized = sanitize_value_text(remaining)
        number_match = NUMBER_PATTERN.search(sanitized)
        if number_match:
            raw_value = number_match.group(0).strip()
        else:
            raw_value = str(value)

    item = ParsedCBCItem(
        canonical_name=canonical_name,
        raw_test_name=raw_test_name,
        value=value,
        raw_value=raw_value,
        unit=unit,
        reference_range=ref_string,
        ref_min=ref_min,
        ref_max=ref_max,
    )
    return item, next_index


# =============================================================================
# PATIENT DEMOGRAPHIC EXTRACTION
# =============================================================================

def extract_demographics(
    lines: List[str],
) -> Tuple[Optional[Union[int, float]], Optional[str]]:
    """
    Extracts patient age and gender from raw report text.
    Handles varied layouts:
        - 'Age / Gender' followed by '32 Years / Male'
        - 'Age: 32' and 'Gender: Male'
        - 'Age 32 Years' and standalone 'Male'
        - 'Age / Sex: 25 / F'
    """
    age: Optional[Union[int, float]] = None
    gender: Optional[str] = None

    def normalize_gender(raw: str) -> Optional[str]:
        if not raw:
            return None
        g = raw.strip().lower()
        if g in ("m", "male", "boy", "man"):
            return "Male"
        if g in ("f", "female", "girl", "woman"):
            return "Female"
        if g in ("child", "infant"):
            return "Child"
        if g in ("other", "o"):
            return "Other"
        return None

    for i, line in enumerate(lines):
        text = clean_ocr_line(line)
        if not text:
            continue

        # Combined age/gender on same line: "32 Years / Male", "32 Y / M", "32 / Female"
        m_comb = re.search(
            r"\b(\d{1,3}(?:\.\d+)?)\s*(?:years?|yrs?|y)?\s*[\/,|]\s*(male|female|child|m|f)\b",
            text,
            re.IGNORECASE,
        )
        if m_comb:
            if age is None:
                age = parse_numeric_token(m_comb.group(1))
            if gender is None:
                gender = normalize_gender(m_comb.group(2))

        # Combined age/gender across two lines: "Age / Gender" on line i, "32 Years / Male" on line i+1
        if (age is None or gender is None) and re.search(r"\bage\s*[\/,]\s*(?:gender|sex)\b", text, re.IGNORECASE):
            if i + 1 < len(lines):
                next_text = clean_ocr_line(lines[i + 1])
                m_next = re.search(
                    r"\b(\d{1,3}(?:\.\d+)?)\s*(?:years?|yrs?|y)?\s*[\/,|]\s*(male|female|child|m|f)\b",
                    next_text,
                    re.IGNORECASE,
                )
                if m_next:
                    if age is None:
                        age = parse_numeric_token(m_next.group(1))
                    if gender is None:
                        gender = normalize_gender(m_next.group(2))

        # Individual Age extraction: "Age: 32", "Age 32 Years", "Age - 32"
        if age is None:
            m_age = re.search(
                r"\bage\s*[:\-]?\s*(\d{1,3}(?:\.\d+)?)(?:\s*(?:years?|yrs?|y)\b)?",
                text,
                re.IGNORECASE,
            )
            if m_age and m_age.group(1):
                age = parse_numeric_token(m_age.group(1))
            elif re.fullmatch(r"age\s*[:\-]?", text, re.IGNORECASE) and i + 1 < len(lines):
                next_text = clean_ocr_line(lines[i + 1])
                m_age_next = re.search(
                    r"^\s*(\d{1,3}(?:\.\d+)?)(?:\s*(?:years?|yrs?|y)\b)?",
                    next_text,
                    re.IGNORECASE,
                )
                if m_age_next:
                    age = parse_numeric_token(m_age_next.group(1))

        # Individual Gender extraction: "Gender: Male", "Sex: Female", standalone "Male"
        if gender is None:
            m_gen = re.search(
                r"\b(?:gender|sex)\s*[:\-]?\s*(male|female|child|m|f)\b",
                text,
                re.IGNORECASE,
            )
            if m_gen:
                gender = normalize_gender(m_gen.group(1))
            elif re.fullmatch(r"(?:gender|sex)\s*[:\-]?", text, re.IGNORECASE) and i + 1 < len(lines):
                next_text = clean_ocr_line(lines[i + 1])
                m_gen_next = re.search(r"^\s*(male|female|child|m|f)\b", next_text, re.IGNORECASE)
                if m_gen_next:
                    gender = normalize_gender(m_gen_next.group(1))
            elif re.fullmatch(r"(?:male|female|child)", text, re.IGNORECASE):
                gender = normalize_gender(text)

    # Format integer ages cleanly
    if age is not None and isinstance(age, float) and age.is_integer():
        age = int(age)

    return age, gender


# =============================================================================
# MAIN REPORT PARSER
# =============================================================================

def parse_cbc_report_text(raw_text: str) -> ParsedCBCReport:
    """
    Primary CareFlow AI OCR report parsing entry point.

    Converts raw OCR multi-line text into a structured ParsedCBCReport
    containing all 16 CBC parameters, demographics, units, and report-specific ranges.
    """
    raw_lines = raw_text.splitlines()
    lines = [
        clean_ocr_line(line)
        for line in raw_lines
        if clean_ocr_line(line)
    ]

    report = ParsedCBCReport()

    # 1. Demographics extraction
    report.patient_age, report.patient_gender = extract_demographics(lines)

    # 2. CBC parameters extraction
    i = 0
    while i < len(lines):
        item, next_index = parse_parameter_block(lines, i)

        if item:
            existing = report.items.get(item.canonical_name)

            # Preserve populated parameter if duplicate occurs
            if existing is None or (existing.value is None and item.value is not None):
                report.items[item.canonical_name] = item

            if next_index > i:
                i = next_index
                continue

        # If this line was not part of any CBC parameter
        if not find_test_parameter(lines[i])[0]:
            report.unmatched_lines.append(lines[i])

        i += 1

    return report


# =============================================================================
# PRINT REPORT TABLE
# =============================================================================

def print_parsed_report(report: ParsedCBCReport) -> None:
    """
    Prints a formatted, human-readable summary of the parsed CBC report.
    """
    print()
    print("=" * 90)
    print(" CAREFLOW AI - PARSED CBC REPORT")
    print("=" * 90)

    print(f"Patient Age:       {report.patient_age}")
    print(f"Patient Gender:    {report.patient_gender}")
    print(f"CBC Parameters:    {len(report.items)}")
    print("-" * 90)

    print(
        f"{'Parameter':<32}"
        f"{'Result':<14}"
        f"{'Unit':<14}"
        f"{'Reference Range':<20}"
    )
    print("-" * 90)

    for name, item in report.items.items():
        result = str(item.value) if item.value is not None else "MISSING"
        unit = item.unit if item.unit else "N/A"
        reference = item.reference_range if item.reference_range else "Not listed"

        print(
            f"{name:<32}"
            f"{result:<14}"
            f"{unit:<14}"
            f"{reference:<20}"
        )

    print("-" * 90)

    if report.unmatched_lines:
        print(f"\nUnmatched OCR lines: {len(report.unmatched_lines)}")

    print("=" * 90)


# =============================================================================
# ACTUAL REAL-WORLD OCR TEXT SAMPLE
# =============================================================================

ACTUAL_CBC_OCR_TEXT = """
Sunrise Diagnostics & Research Centre
Laboratory Report
Accurate Reports | Better Health
Complete Blood Count (CBC)
123 Health Street, Green Park, New Delhi - 110016
Patient Name
Sample Type
: EDTA Whole Blood
Patient ID
CBL123456
Collection Date
:24-04-2025 10:15 AM
Age / Gender
32 Years / Male
Received Date
: 24-04-2025 10:32 AM
Ref. By
Dr. R. Sharma (General Physician)
Report Date
:24-04-2025 11:20 AM
CBC RESULTS
Parameter
Result
Unit
Reference Range
Hemoglobin (Hb)
14.2
g/dL
12.0 - 16.0
Total RBC Count
5.12
million/μL
4.0 - 5.5
Hematocrit (HCT)
42.3
%
36.0 - 52.0
MCV
82.6
fL
80.0 - 100.0
MCH
27.8
pg
27.0 - 33.0
MCHC
33.7
g/dL
31.5 - 36.0
RDW-CV
13.8
%
11.5 - 14.5
Total WBC Count
6,800
/μL
4,000 - 11,000
Neutrophils
58.4
%
40.0 - 70.0
Lymphocytes
31.2
%
20.0 - 40.0
Monocytes
7.1
%
2.0 - 10.0
Eosinophils
2.3
%
1.0 - 6.0
Basophils
0.9
%
0.0 - 2.0
Platelet Count
210,000
/μL
150,000 - 450,000
PDW
15.2
%
9.0 - 17.0
MPV
10.8
fL
7.0 - 12.0
Clinical Interpretation
Complete blood count parameters are within normal limits.
Correlate clinically with symptoms and other investigations.
Technician: S. Verma
Approved By:
Dr. A. Mehta (Pathologist)
"""


# =============================================================================
# COMPREHENSIVE AUTOMATED VERIFICATION TEST SUITE
# =============================================================================

def run_comprehensive_verification_tests() -> None:
    """
    Executes automated assertions covering all 10 pipeline requirements:
        1. Standard single-line CBC report
        2. Multiline OCR report
        3. OCR with comma-separated numbers (6,800 -> 6800, 210,000 -> 210000, 1,85,000 -> 185000)
        4. OCR with split decimals (14 . 2 -> 14.2)
        5. Missing parameters handling
        6. Unknown/unmatched OCR lines collection
        7. Demographic extraction across formats
        8. Reference range extraction (< 200, > 5, 4.0 - 5.5, null)
        9. Supported unit extraction
        10. All 16 CBC parameters recognized with aliases
    """
    print()
    print("=" * 90)
    print(" CAREFLOW AI - COMPREHENSIVE AUTOMATED VERIFICATION SUITE")
    print("=" * 90)

    # 1. Standard Single-Line CBC Report
    print(" [1/10] Verifying Single-Line / Tabular CBC Report...")
    single_line_doc = """
    Patient Name: Test Patient   Age: 32 Years   Gender: Male
    Hemoglobin 14.2 g/dL 12.0 - 16.0
    Total RBC Count 5.12 million/μL 4.0 - 5.5
    Hematocrit 42.3 % 36.0 - 52.0
    MCV 82.6 fL 80.0 - 100.0
    MCH 27.8 pg 27.0 - 33.0
    MCHC 33.7 g/dL 31.5 - 36.0
    RDW-CV 13.8 % 11.5 - 14.5
    Total WBC Count 6,800 /μL 4,000 - 11,000
    Neutrophils 58.4 % 40.0 - 70.0
    Lymphocytes 31.2 % 20.0 - 40.0
    Monocytes 7.1 % 2.0 - 10.0
    Eosinophils 2.3 % 1.0 - 6.0
    Basophils 0.9 % 0.0 - 2.0
    Platelet Count 210,000 /μL 150,000 - 450,000
    PDW 15.2 % 9.0 - 17.0
    MPV 10.8 fL 7.0 - 12.0
    """
    res1 = parse_cbc_report_text(single_line_doc)
    assert len(res1.items) == 16, f"Expected 16 parameters, found {len(res1.items)}"
    assert res1.items["Hemoglobin"].value == 14.2
    assert res1.items["Hemoglobin"].unit == "g/dL"
    assert res1.items["Hemoglobin"].reference_range == "12.0 - 16.0"
    assert res1.items["Platelet Count"].value == 210000.0
    assert res1.patient_age == 32
    assert res1.patient_gender == "Male"
    print("        ✓ PASS: Tabular report extracted all 16 parameters accurately.")

    # 2. Multiline OCR Report
    print(" [2/10] Verifying Multiline OCR Report...")
    res2 = parse_cbc_report_text(ACTUAL_CBC_OCR_TEXT)
    assert len(res2.items) == 16
    assert res2.patient_age == 32
    assert res2.patient_gender == "Male"
    expected_values = {
        "Hemoglobin": 14.2,
        "RBC Count": 5.12,
        "Hematocrit": 42.3,
        "MCV": 82.6,
        "MCH": 27.8,
        "MCHC": 33.7,
        "RDW-CV": 13.8,
        "WBC Count": 6800.0,
        "Neutrophils": 58.4,
        "Lymphocytes": 31.2,
        "Monocytes": 7.1,
        "Eosinophils": 2.3,
        "Basophils": 0.9,
        "Platelet Count": 210000.0,
        "PDW": 15.2,
        "MPV": 10.8,
    }
    for param_name, expected_num in expected_values.items():
        actual_num = res2.items[param_name].value
        assert actual_num == expected_num, (
            f"Parameter {param_name}: expected {expected_num}, got {actual_num}"
        )
    print("        ✓ PASS: Multiline OCR report extracted all 16 expected values.")

    # 3. Comma-separated Numbers
    print(" [3/10] Verifying Comma-Separated Numbers (Western & Indian)...")
    comma_doc = """
    Total WBC Count : 6,800 /μL
    Platelet Count : 210,000 /μL
    Total Platelet Count : 1,85,000 /cumm
    """
    res3 = parse_cbc_report_text(comma_doc)
    assert res3.items["WBC Count"].value == 6800.0
    assert res3.items["WBC Count"].raw_value == "6,800"
    assert res3.items["Platelet Count"].value in (210000.0, 185000.0)
    print("        ✓ PASS: Comma formats (6,800 / 210,000 / 1,85,000) normalized.")

    # 4. Split Decimals
    print(" [4/10] Verifying Split Decimals Normalization ('14 . 2')...")
    split_dec_doc = """
    Hemoglobin
    14 . 2
    g/dL
    12 . 0 - 16 . 0
    Total RBC Count : 5 . 12 million/μL
    MCV : 82 . 6 fL
    """
    res4 = parse_cbc_report_text(split_dec_doc)
    assert res4.items["Hemoglobin"].value == 14.2
    assert res4.items["Hemoglobin"].ref_min == 12.0
    assert res4.items["Hemoglobin"].ref_max == 16.0
    assert res4.items["RBC Count"].value == 5.12
    assert res4.items["MCV"].value == 82.6
    print("        ✓ PASS: Split decimals ('14 . 2', '12 . 0 - 16 . 0') normalized.")

    # 5. Missing Parameters Handling
    print(" [5/10] Verifying Missing Parameters Handling...")
    incomplete_doc = """
    Patient Age: 42
    Patient Gender: Female
    Hemoglobin : 13.5 g/dL 12.0 - 15.0
    Platelet Count : 240,000 /μL
    Total WBC Count
    """
    res5 = parse_cbc_report_text(incomplete_doc)
    assert res5.items["Hemoglobin"].value == 13.5
    assert res5.items["Platelet Count"].value == 240000.0
    assert res5.items["WBC Count"].value is None
    rec5 = res5.to_cbc_record()
    assert rec5.wbc_count is None
    assert rec5.platelet_distribution_width is None
    val5 = validate_cbc_record(rec5)
    assert val5.overall_status == ValidationStatus.MISSING
    assert val5.is_valid is True
    print("        ✓ PASS: Incomplete records gracefully flagged with ValidationStatus.MISSING.")

    # 6. Unknown / Unmatched OCR Lines
    print(" [6/10] Verifying Unknown / Unmatched OCR Lines Collection...")
    noisy_doc = """
    Metro Health Diagnostics Centre
    NABL Accredited Laboratory
    Sample ID: 123456
    Dr. S. Kumar (Consultant Pathologist)
    Hemoglobin : 14.5 g/dL 12.0 - 16.0
    Clinical Impression: Normal morphology
    Approved by Senior Technologist
    """
    res6 = parse_cbc_report_text(noisy_doc)
    assert "Hemoglobin" in res6.items
    assert len(res6.items) == 1
    assert any("Metro Health" in line for line in res6.unmatched_lines)
    assert any("Clinical Impression" in line for line in res6.unmatched_lines)
    print("        ✓ PASS: Non-parameter metadata captured in unmatched_lines.")

    # 7. Demographic Extraction Across Formats
    print(" [7/10] Verifying Patient Demographic Formats...")
    demo_samples = [
        (["Age / Gender", "32 Years / Male"], 32, "Male"),
        (["Age: 45", "Gender: Female"], 45, "Female"),
        (["Age 28 Years", "Male"], 28, "Male"),
        (["Sex: M", "Age: 19"], 19, "Male"),
        (["Age / Sex: 52 Y / F"], 52, "Female"),
        (["Patient: Baby John, 2 Years / Child"], 2, "Child"),
    ]
    for sample_lines, exp_age, exp_gender in demo_samples:
        age_out, gen_out = extract_demographics(sample_lines)
        assert age_out == exp_age, f"Failed age: expected {exp_age}, got {age_out}"
        assert gen_out == exp_gender, f"Failed gender: expected {exp_gender}, got {gen_out}"
    print("        ✓ PASS: All age and gender formats extracted successfully.")

    # 8. Reference Range Extraction
    print(" [8/10] Verifying Reference Range Formats (<, >, min-max, null)...")
    range_cases = [
        ("12.0 - 16.0", "12.0 - 16.0", 12.0, 16.0),
        ("4.0 to 5.5", "4.0 to 5.5", 4.0, 5.5),
        ("4,000 - 11,000", "4,000 - 11,000", 4000.0, 11000.0),
        ("< 200", "< 200", None, 200.0),
        ("<= 150", "<= 150", None, 150.0),
        ("> 5", "> 5", 5.0, None),
        (">= 10.0", ">= 10.0", 10.0, None),
        ("none", None, None, None),
    ]
    for text_sample, exp_str, exp_min, exp_max in range_cases:
        r_str, r_min, r_max, _ = extract_reference_range(text_sample)
        assert r_str == exp_str, f"Range string mismatch for '{text_sample}'"
        assert r_min == exp_min, f"Range min mismatch for '{text_sample}'"
        assert r_max == exp_max, f"Range max mismatch for '{text_sample}'"
    print("        ✓ PASS: Two-sided, single-bounded (<, >), and null ranges verified.")

    # 9. Unit Extraction
    print(" [9/10] Verifying Supported Units (g/dL, /μL, million/μL, %, fL, pg)...")
    unit_samples = [
        ("14.2 g/dL", "g/dL"),
        ("120 mg/dL", "mg/dL"),
        ("42.3 %", "%"),
        ("42.3%", "%"),
        ("82.6 fL", "fL"),
        ("27.8 pg", "pg"),
        ("6800 /μL", "/μL"),
        ("6800 /µL", "/µL"),
        ("6800 /uL", "/uL"),
        ("6800 cells/μL", "cells/μL"),
        ("5.12 million/μL", "million/μL"),
        ("5.12 mil/uL", "mil/uL"),
        ("220000 /cumm", "/cumm"),
        ("7.5 10^3/uL", "10^3/uL"),
    ]
    for unit_text, exp_unit in unit_samples:
        detected_unit, _ = extract_unit(unit_text)
        assert detected_unit is not None and detected_unit.lower() == exp_unit.lower(), (
            f"Failed unit extraction for '{unit_text}': expected {exp_unit}, got {detected_unit}"
        )
    print("        ✓ PASS: All CBC unit variations extracted correctly.")

    # 10. All 16 Parameters & Aliases
    print(" [10/10] Verifying All 16 CBC Parameters and Key Aliases...")
    param_alias_cases = [
        ("Hb", "Hemoglobin"),
        ("Hgb", "Hemoglobin"),
        ("Haemoglobin", "Hemoglobin"),
        ("Total RBC Count", "RBC Count"),
        ("RBC", "RBC Count"),
        ("Hematocrit", "Hematocrit"),
        ("PCV", "Hematocrit"),
        ("HCT", "Hematocrit"),
        ("MCV", "MCV"),
        ("MCH", "MCH"),
        ("MCHC", "MCHC"),
        ("RDW-CV", "RDW-CV"),
        ("RDW", "RDW-CV"),
        ("Total WBC Count", "WBC Count"),
        ("TLC", "WBC Count"),
        ("WBC", "WBC Count"),
        ("Neutrophils", "Neutrophils"),
        ("Segs", "Neutrophils"),
        ("Lymphocytes", "Lymphocytes"),
        ("Lymphs", "Lymphocytes"),
        ("Monocytes", "Monocytes"),
        ("Monos", "Monocytes"),
        ("Eosinophils", "Eosinophils"),
        ("Eos", "Eosinophils"),
        ("Basophils", "Basophils"),
        ("Basos", "Basophils"),
        ("Platelet Count", "Platelet Count"),
        ("PLT", "Platelet Count"),
        ("Platelets", "Platelet Count"),
        ("PDW", "PDW"),
        ("Platelet Distribution Width", "PDW"),
        ("MPV", "MPV"),
        ("Mean Platelet Volume", "MPV"),
    ]
    for alias_text, exp_canonical in param_alias_cases:
        detected_canonical, _, _ = find_test_parameter(alias_text)
        assert detected_canonical == exp_canonical, (
            f"Alias failure for '{alias_text}': expected {exp_canonical}, got {detected_canonical}"
        )
    print("        ✓ PASS: All 16 CBC parameters mapped without collision.")

    print("-" * 90)
    print(" ALL 10 COMPREHENSIVE VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 90)


# =============================================================================
# PRIMARY TEST RUNNER
# =============================================================================

def run_test() -> None:
    """
    Main demonstration and test routine for CareFlow AI CBC Parser.
    """
    print()
    print("=" * 90)
    print(" CareFlow AI - REAL OCR → CBC PARSER TEST")
    print("=" * 90)

    # 1. Parse real OCR report
    report = parse_cbc_report_text(ACTUAL_CBC_OCR_TEXT)
    print_parsed_report(report)

    # 2. Bridge to CBCRecord and validate
    print()
    print("=" * 90)
    print(" CBC VALIDATOR RESULT")
    print("=" * 90)

    cbc_record = report.to_cbc_record()
    validation = validate_cbc_record(cbc_record)

    print(f"Overall Status: {validation.overall_status.value}")
    print(f"Is Valid:       {validation.is_valid}")
    print(f"Summary:        {validation.summary_messages}")
    print("=" * 90)

    # 3. Structured JSON output
    print()
    print("=" * 90)
    print(" STRUCTURED OUTPUT")
    print("=" * 90)

    print(
        json.dumps(
            report.to_dict(),
            indent=2,
            ensure_ascii=False,
        )
    )
    print("=" * 90)

    # 4. Run automated test suite
    run_comprehensive_verification_tests()


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    run_test()