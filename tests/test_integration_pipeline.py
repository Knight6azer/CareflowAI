"""
Integration test for CareFlow AI End-to-End Clinical Processing Pipeline.
"""

import unittest
from ml.ocr.report_parser import parse_cbc_report_text
from ml.cbc_validator import validate_cbc_record
from ml.cbc_schema import ValidationStatus


class TestIntegrationPipeline(unittest.TestCase):
    def test_full_pipeline_raw_text_to_validated_output(self):
        # 1. Raw OCR input text with realistic formatting and artifacts
        raw_ocr = """
        Metropolis Healthcare Diagnostics
        Patient Name: Anita Sharma
        Age / Gender: 28 Yrs / Female
        Complete Blood Count (CBC)
        Hemoglobin (Hb) 11 . 2 g/dL (12.0 - 15.0)
        Total RBC Count 4.20 million/uL (3.8 - 5.0)
        Total WBC Count 6,500 /uL (4,000 - 11,000)
        Platelet Count 2,40,000 /uL (150,000 - 450,000)
        Platelet Distribution Width (PDW) 15.2 % (9.0 - 17.0)
        Packed Cell Volume (PCV) 34.5 % (36.0 - 46.0)
        Mean Corpuscular Volume (MCV) 82.1 fL (80.0 - 98.0)
        Neutrophils 62.0 % (40.0 - 70.0)
        Lymphocytes 28.0 % (20.0 - 40.0)
        Monocytes 6.0 % (2.0 - 10.0)
        Eosinophils 3.0 % (1.0 - 6.0)
        Basophils 1.0 % (0.0 - 2.0)
        """

        # 2. Parse text with report_parser
        report = parse_cbc_report_text(raw_ocr)
        self.assertEqual(report.patient_age, 28)
        self.assertEqual(report.patient_gender, "Female")
        self.assertEqual(report.items["Hemoglobin"].value, 11.2)
        self.assertEqual(report.items["Platelet Count"].value, 240000.0)
        self.assertEqual(report.items["WBC Count"].value, 6500.0)

        # 3. Bridge to CBCRecord
        record = report.to_cbc_record()
        self.assertEqual(record.hemoglobin_g_dl, 11.2)
        self.assertEqual(record.platelet_count, 240000.0)

        # 4. Validate through Clinical Validation Firewall
        val_result = validate_cbc_record(record)
        self.assertTrue(val_result.is_valid)
        self.assertEqual(val_result.overall_status, ValidationStatus.VALID)

        # 5. Verify non-diagnostic summary presence
        self.assertGreater(len(val_result.summary_messages), 0)


if __name__ == "__main__":
    unittest.main()
