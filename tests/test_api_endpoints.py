"""
Unit tests for CareFlow AI FastAPI Service Endpoints.
"""

import unittest
from io import BytesIO
from fastapi import UploadFile
from api import (
    health_check,
    validate_record,
    parse_ocr_text,
    upload_report,
    CBCValidateRequest,
    ParseTextRequest,
    sanitize_filename,
    verify_file_magic,
)


class TestAPIEndpoints(unittest.TestCase):
    def test_health_check(self):
        res = health_check()
        self.assertEqual(res["status"], "healthy")
        self.assertIn("en", res["supported_languages"])
        self.assertIn("hi", res["supported_languages"])
        self.assertTrue(res["non_diagnostic_boundary"])

    def test_validate_record_valid(self):
        req = CBCValidateRequest(
            age=32.0,
            gender="Male",
            hemoglobin_g_dl=14.2,
            wbc_count=6500.0,
            platelet_count=220000.0,
            platelet_distribution_width=15.0,
        )
        res = validate_record(req)
        self.assertEqual(res.status_code, 200)

    def test_validate_record_invalid_status_422(self):
        req = CBCValidateRequest(
            age=32.0,
            gender="Male",
            hemoglobin_g_dl=14.2,
            wbc_count=6500.0,
            platelet_count=-50000.0,  # Negative count -> INVALID
            platelet_distribution_width=15.0,
        )
        res = validate_record(req)
        self.assertEqual(res.status_code, 422)

    def test_parse_ocr_text(self):
        text = "Hemoglobin: 14.2 g/dL\nWBC: 6,800 /uL\nPlatelets: 210,000 /uL"
        req = ParseTextRequest(raw_text=text)
        res = parse_ocr_text(req)
        self.assertEqual(res.status_code, 200)

    def test_filename_sanitization(self):
        self.assertEqual(sanitize_filename("../../etc/passwd"), "passwd")
        self.assertEqual(sanitize_filename("report_lab<1>.pdf"), "report_lab_1_.pdf")

    def test_file_magic_verification(self):
        self.assertEqual(verify_file_magic(b"%PDF-1.4 header"), "application/pdf")
        self.assertEqual(verify_file_magic(b"\xff\xd8\xff\xe0 image"), "image/jpeg")
        self.assertEqual(verify_file_magic(b"\x89PNG\r\n\x1a\n image"), "image/png")
        self.assertIsNone(verify_file_magic(b"CORRUPTED_FILE_DATA"))

    def test_upload_report_valid_pdf(self):
        pdf_bytes = b"%PDF-1.5 test document data"
        upload_file = UploadFile(filename="lab_report.pdf", file=BytesIO(pdf_bytes))
        res = upload_report(upload_file)
        self.assertEqual(res.status_code, 200)


if __name__ == "__main__":
    unittest.main()
