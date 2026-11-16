"""
Unit and boundary tests for CareFlow AI Clinical Validation Firewall.
"""

import unittest
from ml.cbc_schema import CBCRecord, ValidationStatus
from ml.cbc_validator import (
    is_missing_value,
    parse_numeric,
    validate_gender,
    validate_numeric_field,
    validate_cbc_record,
)


class TestCBCValidator(unittest.TestCase):
    def test_missing_value_detection(self):
        self.assertTrue(is_missing_value(None))
        self.assertTrue(is_missing_value(""))
        self.assertTrue(is_missing_value("   "))
        self.assertTrue(is_missing_value("N/A"))
        self.assertTrue(is_missing_value("nan"))
        self.assertTrue(is_missing_value(float("nan")))
        self.assertFalse(is_missing_value(0))
        self.assertFalse(is_missing_value(14.2))
        self.assertFalse(is_missing_value("14.2"))

    def test_numeric_parsing(self):
        val, ok = parse_numeric(14.5)
        self.assertTrue(ok)
        self.assertEqual(val, 14.5)

        val, ok = parse_numeric("140,000")
        self.assertTrue(ok)
        self.assertEqual(val, 140000.0)

        val, ok = parse_numeric("corrupted_text")
        self.assertFalse(ok)
        self.assertIsNone(val)

    def test_gender_validation(self):
        res = validate_gender("Male")
        self.assertEqual(res.status, ValidationStatus.VALID)

        res_miss = validate_gender(None)
        self.assertEqual(res_miss.status, ValidationStatus.MISSING)

        res_review = validate_gender("unspecified_category")
        self.assertEqual(res_review.status, ValidationStatus.OUTLIER_REVIEW)

    def test_numeric_field_bounds(self):
        # Valid Hemoglobin
        res = validate_numeric_field("hemoglobin_g_dl", 14.2)
        self.assertEqual(res.status, ValidationStatus.VALID)

        # Physically impossible Hemoglobin (> 26)
        res_inv = validate_numeric_field("hemoglobin_g_dl", 35.0)
        self.assertEqual(res_inv.status, ValidationStatus.INVALID)

        # Negative Platelet count (impossible)
        res_neg = validate_numeric_field("platelet_count", -1000)
        self.assertEqual(res_neg.status, ValidationStatus.INVALID)

        # Outlier Hemoglobin (physiologically possible but < 9.0 stat fence)
        res_out = validate_numeric_field("hemoglobin_g_dl", 7.5)
        self.assertEqual(res_out.status, ValidationStatus.OUTLIER_REVIEW)

    def test_record_validation_normal(self):
        data = {
            "age": 32,
            "gender": "Female",
            "hemoglobin_g_dl": 13.5,
            "wbc_count": 7000.0,
            "platelet_count": 250000.0,
            "platelet_distribution_width": 15.0,
        }
        res = validate_cbc_record(data)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.overall_status, ValidationStatus.VALID)

    def test_record_validation_missing_parameters(self):
        data = {
            "age": 32,
            "gender": "Female",
            "hemoglobin_g_dl": 13.5,
            "wbc_count": None,
            "platelet_count": 250000.0,
            "platelet_distribution_width": "",
        }
        res = validate_cbc_record(data)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.overall_status, ValidationStatus.MISSING)

    def test_record_validation_outlier_preservation(self):
        data = {
            "age": 45,
            "gender": "Male",
            "hemoglobin_g_dl": 14.0,
            "wbc_count": 6000.0,
            "platelet_count": 420000.0,  # Outlier > 337,250
            "platelet_distribution_width": 15.0,
        }
        res = validate_cbc_record(data)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.overall_status, ValidationStatus.OUTLIER_REVIEW)

    def test_differential_sum_conservation_violation(self):
        data = {
            "age": 30,
            "gender": "Male",
            "hemoglobin_g_dl": 14.0,
            "wbc_count": 6000.0,
            "platelet_count": 200000.0,
            "platelet_distribution_width": 15.0,
            "neutrophils": 30.0,
            "lymphocytes": 20.0,
            "monocytes": 5.0,
            "eosinophils": 2.0,
            "basophils": 1.0,  # Total sum = 58% (violates conservation)
        }
        res = validate_cbc_record(data)
        self.assertFalse(res.is_valid)
        self.assertEqual(res.overall_status, ValidationStatus.INVALID)
        self.assertTrue(any("differential" in m.lower() for m in res.summary_messages))

    def test_rule_of_three_contradiction(self):
        data = {
            "age": 30,
            "gender": "Male",
            "hemoglobin_g_dl": 14.0,
            "hematocrit": 15.0,  # Expected ~42%, 15% is contradiction
            "wbc_count": 6000.0,
            "platelet_count": 200000.0,
            "platelet_distribution_width": 15.0,
        }
        res = validate_cbc_record(data)
        self.assertFalse(res.is_valid)
        self.assertEqual(res.overall_status, ValidationStatus.INVALID)
        self.assertTrue(any("rule of three" in m.lower() for m in res.summary_messages))


if __name__ == "__main__":
    unittest.main()
