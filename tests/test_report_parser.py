"""
Unit and edge-case tests for CareFlow AI OCR Report Parser.
"""

import unittest
from ml.ocr.report_parser import (
    clean_ocr_line,
    parse_numeric_token,
    find_test_parameter,
    extract_reference_range,
    extract_unit,
    parse_cbc_report_text,
)


class TestReportParser(unittest.TestCase):
    def test_split_decimal_normalization(self):
        line = "Hemoglobin 14 . 2 g/dL"
        cleaned = clean_ocr_line(line)
        self.assertEqual(cleaned, "Hemoglobin 14.2 g/dL")
        self.assertEqual(parse_numeric_token("14 . 2"), 14.2)

    def test_comma_number_normalization(self):
        # Western comma format
        self.assertEqual(parse_numeric_token("140,000"), 140000.0)
        self.assertEqual(parse_numeric_token("210,000"), 210000.0)

        # Indian lakh format
        self.assertEqual(parse_numeric_token("1,85,000"), 185000.0)

        # Indian OCR comma-dot artifact: 1.85,000
        self.assertEqual(parse_numeric_token("1.85,000"), 185000.0)

        # European thousand format: 185.000
        self.assertEqual(parse_numeric_token("185.000"), 185000.0)

    def test_dotted_acronyms(self):
        can, raw, rem = find_test_parameter("R.B.C. 5.12 million/uL")
        self.assertEqual(can, "RBC Count")
        self.assertFalse(rem.startswith("."))  # Must not start with period
        self.assertTrue(rem.startswith("5.12"))

        can_w, raw_w, rem_w = find_test_parameter("W.B.C. 6800 /uL")
        self.assertEqual(can_w, "WBC Count")
        self.assertFalse(rem_w.startswith("."))
        self.assertTrue(rem_w.startswith("6800"))

    def test_reference_range_extraction(self):
        # Two-sided range
        ref_s, low, high, rem = extract_reference_range("12.0 - 16.0 g/dL")
        self.assertEqual(low, 12.0)
        self.assertEqual(high, 16.0)

        # Less-than range
        ref_s2, low2, high2, rem2 = extract_reference_range("< 200 mg/dL")
        self.assertIsNone(low2)
        self.assertEqual(high2, 200.0)

        # Greater-than range
        ref_s3, low3, high3, rem3 = extract_reference_range("> 50")
        self.assertEqual(low3, 50.0)
        self.assertIsNone(high3)

    def test_unit_extraction(self):
        u1, r1 = extract_unit("14.2 g/dL")
        self.assertEqual(u1, "g/dL")

        u2, r2 = extract_unit("6800 /uL")
        self.assertEqual(u2, "/uL")

        u3, r3 = extract_unit("5.12 million/uL")
        self.assertEqual(u3, "million/uL")

    def test_full_text_parser_all_edge_cases(self):
        raw_text = """
        Sunrise Diagnostics Laboratory
        Patient Name: John Doe | Age: 42 Years | Gender: Male
        Complete Blood Count
        Hemoglobin 14 . 2 g/dL (12.0 - 16.0)
        R.B.C. 5.12 million/uL (4.5 - 5.5)
        W.B.C. 6,800 /uL (4,000 - 11,000)
        Platelet Count 1.85,000 /uL (150,000 - 450,000)
        Hematocrit 42.6 % (36.0 - 52.0)
        """
        report = parse_cbc_report_text(raw_text)
        self.assertEqual(report.patient_age, 42)
        self.assertEqual(report.patient_gender, "Male")
        self.assertEqual(report.items["Hemoglobin"].value, 14.2)
        self.assertEqual(report.items["RBC Count"].value, 5.12)
        self.assertEqual(report.items["WBC Count"].value, 6800.0)
        self.assertEqual(report.items["Platelet Count"].value, 185000.0)
        self.assertEqual(report.items["Hematocrit"].value, 42.6)


if __name__ == "__main__":
    unittest.main()
