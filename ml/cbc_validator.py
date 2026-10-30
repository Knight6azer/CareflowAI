"""
=============================================================================
CareFlow AI - CBC Data Validation Engine
=============================================================================
File: ml/cbc_validator.py

Purpose:
    Provides robust, non-diagnostic data validation for extracted Complete
    Blood Count (CBC) parameters.

Pipeline Position:
    Uploaded Report Image/PDF
    -> OCR Parsing
    -> Structured CBC Values (CBCRecord)
    -> [THIS MODULE: Data Validation]
    -> Report Reference-Range Comparison
    -> Patient-Friendly Clinical Explanation

Validation Statuses:
    - VALID: Value is numeric, positive, and within expected statistical distributions.
    - MISSING: Parameter was not found or omitted in the laboratory report.
    - INVALID: Value is non-numeric, negative, or biologically impossible (e.g. OCR error).
    - OUTLIER_REVIEW: Value is statistically unusual (e.g. beyond 1.5 * IQR) but
      physiologically possible. Flagged for review without automatic deletion.

Important Principles:
    - NO DISEASE DIAGNOSIS: This validator checks data integrity and statistical
      distribution only. It never claims or attempts to diagnose any disease.
    - NO HARD-CODED UNIVERSAL REFERENCE RANGES: Reference ranges vary significantly
      across laboratories, instrumentation, and reagents. Specific reference intervals
      should be extracted directly from the patient's uploaded report in future stages.
    - PRESERVATION OF CLINICAL EXTREMES: Real medical conditions often produce
      extreme values (e.g., severe thrombocytopenia or reactive thrombocytosis).
      Statistical outliers are flagged for clinical review, never auto-discarded.
=============================================================================
"""

import math
from typing import Any, Dict, Optional, Tuple, Union

try:
    from cbc_schema import (
        CBCRecord,
        CBCValidationResult,
        FieldValidationResult,
        ValidationStatus,
    )
except ImportError:
    from ml.cbc_schema import (
        CBCRecord,
        CBCValidationResult,
        FieldValidationResult,
        ValidationStatus,
    )


# =============================================================================
# Statistical Outlier & Biological Plausibility Boundaries
# =============================================================================
# Note:
# 'stat_bounds' are derived directly from the empirical IQR data-quality analysis
# of the cleaned CBC dataset (Q1 - 1.5*IQR to Q3 + 1.5*IQR).
# 'bio_bounds' represent absolute physiological plausibility limits. Anything
# outside 'bio_bounds' is treated as an OCR parsing error or invalid entry.
# =============================================================================

PARAMETER_CONSTRAINTS = {
    "age": {
        "unit": "years",
        "bio_min": 0.0,
        "bio_max": 125.0,
        "stat_min": 0.0,
        "stat_max": 97.0,  # IQR upper fence from careflow_cbc_clean.csv
    },
    "hemoglobin_g_dl": {
        "unit": "g/dL",
        "bio_min": 2.0,
        "bio_max": 26.0,
        "stat_min": 9.0,   # IQR lower fence
        "stat_max": 18.6,  # IQR upper fence
    },
    "wbc_count": {
        "unit": "cells/mcL",
        "bio_min": 200.0,
        "bio_max": 400000.0,
        "stat_min": 1500.0, # Clinical lower threshold
        "stat_max": 11600.0,# IQR upper fence
    },
    "platelet_count": {
        "unit": "cells/mcL",
        "bio_min": 1000.0,
        "bio_max": 2500000.0,
        "stat_min": 35000.0, # Severe thrombocytopenia threshold
        "stat_max": 337250.0,# IQR upper fence from careflow_cbc_clean.csv
    },
    "platelet_distribution_width": {
        "unit": "%",
        "bio_min": 1.0,
        "bio_max": 80.0,
        "stat_min": 8.0,
        "stat_max": 48.9,   # IQR upper fence from careflow_cbc_clean.csv
    },
}

VALID_GENDER_VALUES = {"male", "female", "child", "m", "f", "boy", "girl", "other"}


# =============================================================================
# Core Field-Level Validation Functions
# =============================================================================

def is_missing_value(val: Any) -> bool:
    """
    Checks if a given value represents a missing, omitted, or unparsed field.
    """
    if val is None:
        return True
    if isinstance(val, str) and val.strip().lower() in {"", "none", "null", "nan", "na", "n/a", "missing"}:
        return True
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return True
    return False


def parse_numeric(val: Any) -> Tuple[Optional[float], bool]:
    """
    Attempts to safely convert an input value (string, int, float) to float.
    Handles common OCR formatting like commas in numbers (e.g. '140,000' -> 140000.0).

    Returns:
        (float_value, True) if successfully parsed
        (None, False) if non-numeric or malformed
    """
    if val is None:
        return None, False
    if isinstance(val, (int, float)):
        if math.isnan(val) or math.isinf(val):
            return None, False
        return float(val), True

    if isinstance(val, str):
        cleaned = val.strip().replace(",", "")
        try:
            parsed = float(cleaned)
            if math.isnan(parsed) or math.isinf(parsed):
                return None, False
            return parsed, True
        except ValueError:
            return None, False

    return None, False


def validate_gender(gender_val: Any) -> FieldValidationResult:
    """
    Validates patient gender / sex categorization.
    """
    if is_missing_value(gender_val):
        return FieldValidationResult(
            field_name="gender",
            status=ValidationStatus.MISSING,
            raw_value=gender_val,
            cleaned_value=None,
            message="Gender is missing from report.",
        )

    if not isinstance(gender_val, str):
        return FieldValidationResult(
            field_name="gender",
            status=ValidationStatus.INVALID,
            raw_value=gender_val,
            cleaned_value=None,
            message=f"Gender must be a text value, got {type(gender_val).__name__}.",
        )

    clean_gender = gender_val.strip().lower()
    if clean_gender in VALID_GENDER_VALUES:
        return FieldValidationResult(
            field_name="gender",
            status=ValidationStatus.VALID,
            raw_value=gender_val,
            cleaned_value=None,
            message=f"Valid gender category: '{gender_val.strip()}'.",
        )
    else:
        return FieldValidationResult(
            field_name="gender",
            status=ValidationStatus.OUTLIER_REVIEW,
            raw_value=gender_val,
            cleaned_value=None,
            message=f"Unrecognized gender label '{gender_val}'. Requires manual verification.",
        )


def validate_numeric_field(field_name: str, value: Any) -> FieldValidationResult:
    """
    Validates a specific numeric CBC parameter against missingness, numeric
    integrity, biological possibility, and statistical distribution fences.

    Status decisions:
        - MISSING: Empty / None / NaN
        - INVALID: Non-numeric string or outside biological feasibility (e.g. negative values)
        - OUTLIER_REVIEW: Plausible biological value that falls outside standard IQR fences
        - VALID: Numeric, positive, and within standard statistical expectations
    """
    constraints = PARAMETER_CONSTRAINTS.get(field_name)
    if not constraints:
        # Fallback for unrecognized parameter
        parsed, success = parse_numeric(value)
        if not success:
            return FieldValidationResult(
                field_name=field_name,
                status=ValidationStatus.INVALID,
                raw_value=value,
                message=f"Field '{field_name}' must be numeric.",
            )
        return FieldValidationResult(
            field_name=field_name,
            status=ValidationStatus.VALID,
            raw_value=value,
            cleaned_value=parsed,
            message=f"Valid numeric value: {parsed}",
        )

    # 1. Missingness check
    if is_missing_value(value):
        return FieldValidationResult(
            field_name=field_name,
            status=ValidationStatus.MISSING,
            raw_value=value,
            cleaned_value=None,
            message=f"{field_name} is missing from the record.",
        )

    # 2. Numeric parsing check
    parsed, success = parse_numeric(value)
    if not success:
        return FieldValidationResult(
            field_name=field_name,
            status=ValidationStatus.INVALID,
            raw_value=value,
            cleaned_value=None,
            message=f"{field_name} has non-numeric value '{value}'. Potential OCR error.",
        )

    unit = constraints["unit"]

    # 3. Biological & Non-positive check
    if parsed < constraints["bio_min"] or parsed > constraints["bio_max"]:
        return FieldValidationResult(
            field_name=field_name,
            status=ValidationStatus.INVALID,
            raw_value=value,
            cleaned_value=parsed,
            message=(
                f"{field_name} value of {parsed} {unit} is outside physically possible "
                f"limits [{constraints['bio_min']}, {constraints['bio_max']} {unit}]. "
                f"Likely OCR error or unit mismatch."
            ),
        )

    # 4. Statistical outlier check (IQR-based from Dataset analysis)
    if parsed < constraints["stat_min"] or parsed > constraints["stat_max"]:
        return FieldValidationResult(
            field_name=field_name,
            status=ValidationStatus.OUTLIER_REVIEW,
            raw_value=value,
            cleaned_value=parsed,
            message=(
                f"{field_name} value of {parsed} {unit} is statistically unusual "
                f"(outside IQR range [{constraints['stat_min']}, {constraints['stat_max']} {unit}]). "
                f"Preserved for clinical review without auto-deletion."
            ),
        )

    # 5. Passed all checks -> VALID
    return FieldValidationResult(
        field_name=field_name,
        status=ValidationStatus.VALID,
        raw_value=value,
        cleaned_value=parsed,
        message=f"{field_name} is valid ({parsed} {unit}).",
    )


# =============================================================================
# Record-Level Validation Function
# =============================================================================

def validate_cbc_record(record_input: Union[CBCRecord, Dict[str, Any]]) -> CBCValidationResult:
    """
    Performs full validation across all extracted CBC fields in a record.

    Args:
        record_input: A CBCRecord instance or a dictionary with CBC fields.

    Returns:
        CBCValidationResult with detailed status for every field and an overall summary.
    """
    if isinstance(record_input, CBCRecord):
        data = record_input.to_dict()
    elif isinstance(record_input, dict):
        data = record_input
    else:
        raise TypeError(f"Expected CBCRecord or dict, got {type(record_input).__name__}")

    field_results: Dict[str, FieldValidationResult] = {}
    summary_messages = []

    # Validate gender
    gender_res = validate_gender(data.get("gender"))
    field_results["gender"] = gender_res

    # Validate numerical fields
    numerical_fields = [
        "age",
        "hemoglobin_g_dl",
        "wbc_count",
        "platelet_count",
        "platelet_distribution_width",
    ]

    for fname in numerical_fields:
        res = validate_numeric_field(fname, data.get(fname))
        field_results[fname] = res

    # Determine overall status according to severity hierarchy:
    # INVALID > MISSING > OUTLIER_REVIEW > VALID
    statuses = [res.status for res in field_results.values()]

    if ValidationStatus.INVALID in statuses:
        overall_status = ValidationStatus.INVALID
        is_valid = False
        invalid_fields = [name for name, r in field_results.items() if r.status == ValidationStatus.INVALID]
        summary_messages.append(
            f"Record contains invalid or corrupted values in: {', '.join(invalid_fields)}. "
            f"Check OCR transcription."
        )
    elif ValidationStatus.MISSING in statuses:
        overall_status = ValidationStatus.MISSING
        is_valid = True  # Technically valid data for present fields, but incomplete
        missing_fields = [name for name, r in field_results.items() if r.status == ValidationStatus.MISSING]
        summary_messages.append(
            f"Record is incomplete. Missing parameters: {', '.join(missing_fields)}."
        )
    elif ValidationStatus.OUTLIER_REVIEW in statuses:
        overall_status = ValidationStatus.OUTLIER_REVIEW
        is_valid = True
        outlier_fields = [name for name, r in field_results.items() if r.status == ValidationStatus.OUTLIER_REVIEW]
        summary_messages.append(
            f"Record has statistically unusual values in: {', '.join(outlier_fields)}. "
            f"Retained for clinical review (not an automatic error)."
        )
    else:
        overall_status = ValidationStatus.VALID
        is_valid = True
        summary_messages.append("All CBC parameters validated successfully.")

    return CBCValidationResult(
        is_valid=is_valid,
        overall_status=overall_status,
        field_results=field_results,
        summary_messages=summary_messages,
    )


# =============================================================================
# Demonstration & Test Section
# =============================================================================

def run_sample_tests() -> None:
    """
    Executes test cases demonstrating all validation statuses:
    1. Sample 1: Clean, typical adult CBC (VALID)
    2. Sample 2: Incomplete report with missing WBC & PDW (MISSING)
    3. Sample 3: Corrupted OCR values & negative values (INVALID)
    4. Sample 4: Clinical extremes (High platelets / PDW) (OUTLIER_REVIEW)
    """
    divider = "=" * 80
    print(f"\n{divider}")
    print(" CareFlow AI - CBC Validator Demonstration & Test Suite")
    print(f"{divider}\n")

    test_cases = [
        {
            "name": "Test Case 1: Normal Adult CBC Record",
            "data": {
                "age": 35,
                "gender": "Male",
                "hemoglobin_g_dl": 14.5,
                "wbc_count": 6500.0,
                "platelet_count": 220000.0,
                "platelet_distribution_width": 15.5,
            },
            "expected_overall": ValidationStatus.VALID,
        },
        {
            "name": "Test Case 2: Incomplete Report (Missing WBC & PDW)",
            "data": {
                "age": 42,
                "gender": "Female",
                "hemoglobin_g_dl": 12.8,
                "wbc_count": None,        # Omitted from scan
                "platelet_count": 180000.0,
                "platelet_distribution_width": "",  # Empty string from OCR
            },
            "expected_overall": ValidationStatus.MISSING,
        },
        {
            "name": "Test Case 3: Corrupted OCR Values (Negative Platelets & Non-numeric Age)",
            "data": {
                "age": "thirty-five",     # Corrupted text
                "gender": "Female",
                "hemoglobin_g_dl": 13.0,
                "wbc_count": 5000.0,
                "platelet_count": -50000.0, # Negative count (impossible)
                "platelet_distribution_width": 14.0,
            },
            "expected_overall": ValidationStatus.INVALID,
        },
        {
            "name": "Test Case 4: Clinical Extreme / Outlier (Severe Thrombocytosis)",
            "data": {
                "age": 48,
                "gender": "Male",
                "hemoglobin_g_dl": 15.2,
                "wbc_count": 8200.0,
                "platelet_count": 410000.0, # Statistically unusual (> 337,250 IQR upper fence)
                "platelet_distribution_width": 53.5, # Statistically high PDW (> 48.9 IQR fence)
            },
            "expected_overall": ValidationStatus.OUTLIER_REVIEW,
        },
    ]

    for test in test_cases:
        print(f"--- {test['name']} ---")
        result = validate_cbc_record(test["data"])

        print(f"Overall Status: {result.overall_status.value} (Expected: {test['expected_overall'].value})")
        print(f"Is Valid:       {result.is_valid}")
        print(f"Summary:        {result.summary_messages[0]}")
        print("Field-level results:")
        for fname, fres in result.field_results.items():
            print(f"  * {fname:28s} -> [{fres.status.value:14s}] {fres.message}")
        print()

    print(f"{divider}")
    print(" ALL SAMPLE TEST CASES EXECUTED SUCCESSFULLY")
    print(f"{divider}\n")


if __name__ == "__main__":
    run_sample_tests()
