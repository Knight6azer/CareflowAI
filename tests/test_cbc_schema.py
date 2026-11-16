"""
Unit tests for CareFlow AI CBC Schema data models.
"""

import unittest
from ml.cbc_schema import CBCRecord, CBCValidationResult, FieldValidationResult, ValidationStatus


class TestCBCSchema(unittest.TestCase):
    def test_validation_status_enum(self):
        self.assertEqual(ValidationStatus.VALID.value, "VALID")
        self.assertEqual(ValidationStatus.MISSING.value, "MISSING")
        self.assertEqual(ValidationStatus.INVALID.value, "INVALID")
        self.assertEqual(ValidationStatus.OUTLIER_REVIEW.value, "OUTLIER_REVIEW")

    def test_cbcrecord_to_dict_and_from_dict(self):
        data = {
            "age": 35.0,
            "gender": "Male",
            "hemoglobin_g_dl": 14.5,
            "wbc_count": 6500.0,
            "platelet_count": 220000.0,
            "platelet_distribution_width": 15.5,
            "rbc_count": 5.1,
            "hematocrit": 42.0,
            "mcv": 85.0,
            "mch": 28.0,
            "mchc": 33.0,
            "rdw_cv": 13.5,
            "neutrophils": 60.0,
            "lymphocytes": 30.0,
            "monocytes": 6.0,
            "eosinophils": 3.0,
            "basophils": 1.0,
            "mpv": 10.0,
        }
        record = CBCRecord.from_dict(data)
        self.assertEqual(record.age, 35.0)
        self.assertEqual(record.gender, "Male")
        self.assertEqual(record.hemoglobin_g_dl, 14.5)
        self.assertEqual(record.neutrophils, 60.0)

        out_dict = record.to_dict()
        for k, v in data.items():
            self.assertEqual(out_dict[k], v)

    def test_field_validation_result_serialization(self):
        fres = FieldValidationResult(
            field_name="hemoglobin_g_dl",
            status=ValidationStatus.VALID,
            raw_value="14.5",
            cleaned_value=14.5,
            message="Valid",
        )
        d = fres.to_dict()
        self.assertEqual(d["field_name"], "hemoglobin_g_dl")
        self.assertEqual(d["status"], "VALID")
        self.assertEqual(d["cleaned_value"], 14.5)

    def test_record_validation_result_serialization(self):
        res = CBCValidationResult(
            is_valid=True,
            overall_status=ValidationStatus.VALID,
            field_results={
                "age": FieldValidationResult("age", ValidationStatus.VALID, 30, 30.0, "OK")
            },
            summary_messages=["All OK"],
        )
        d = res.to_dict()
        self.assertTrue(d["is_valid"])
        self.assertEqual(d["overall_status"], "VALID")
        self.assertIn("age", d["field_results"])


if __name__ == "__main__":
    unittest.main()
