"""
=============================================================================
CareFlow AI - Standalone PaddleOCR Test Utility
=============================================================================
File: ml/ocr/ocr_test.py

Purpose:
    Runs PaddleOCR on a medical report image and displays the extracted
    text with confidence scores.

Usage:
    python ml/ocr/ocr_test.py "cbc report.png"

Optional:
    python ml/ocr/ocr_test.py "cbc report.png" --no-orientation

Requirements:
    pip install paddlepaddle paddleocr
=============================================================================
"""

import argparse
import json
import sys
from pathlib import Path


# ============================================================================
# CHECK PADDLEOCR
# ============================================================================

def check_paddleocr_installed() -> bool:
    """Check whether PaddleOCR is installed."""
    try:
        import paddleocr  # noqa: F401
        return True
    except ImportError:
        return False


# ============================================================================
# EXTRACT TEXT FROM PADDLEOCR RESULT
# ============================================================================

def extract_result_data(result):
    """
    Converts a PaddleOCR result object into a Python dictionary.

    PaddleOCR 3.x exposes structured results through the result object's
    json property.
    """

    try:
        result_json = result.json

        # Some versions expose json as a method
        if callable(result_json):
            result_json = result_json()

        # Convert JSON string to dictionary
        if isinstance(result_json, str):
            result_json = json.loads(result_json)

        return result_json

    except Exception as error:
        print(f"\n[!] Could not read OCR result: {error}")
        return None


# ============================================================================
# MAIN OCR FUNCTION
# ============================================================================

def run_ocr(
    image_path: str,
    lang: str = "en",
    use_textline_orientation: bool = True
) -> None:

    path_obj = Path(image_path).resolve()

    # ------------------------------------------------------------------------
    # 1. CHECK FILE
    # ------------------------------------------------------------------------

    if not path_obj.exists():
        print("\n[!] Image file not found.")
        print(f"    {path_obj}")
        sys.exit(1)

    if not path_obj.is_file():
        print("\n[!] The provided path is not a file.")
        print(f"    {path_obj}")
        sys.exit(1)

    file_size_kb = path_obj.stat().st_size / 1024

    # ------------------------------------------------------------------------
    # 2. HEADER
    # ------------------------------------------------------------------------

    print("=" * 80)
    print(" CareFlow AI - Standalone OCR Engine (PaddleOCR)")
    print("=" * 80)

    print(f"Target Image:             {path_obj.name}")
    print(f"Full Path:                {path_obj}")
    print(f"File Size:                {file_size_kb:.1f} KB")
    print(f"Language:                 {lang}")
    print(
        f"Textline Orientation:     "
        f"{use_textline_orientation}"
    )

    print("-" * 80)

    # ------------------------------------------------------------------------
    # 3. CHECK INSTALLATION
    # ------------------------------------------------------------------------

    if not check_paddleocr_installed():

        print("\n[!] PaddleOCR is not installed.")

        print("\nInstall it using:")
        print("    pip install paddlepaddle paddleocr")

        sys.exit(1)

    # ------------------------------------------------------------------------
    # 4. IMPORT PADDLEOCR
    # ------------------------------------------------------------------------

    try:

        from paddleocr import PaddleOCR

    except Exception as import_error:

        print("\n[!] Could not import PaddleOCR.")
        print(f"    {import_error}")

        sys.exit(1)

    # ------------------------------------------------------------------------
    # 5. INITIALIZE OCR ENGINE
    # ------------------------------------------------------------------------

    print("[+] Initializing PaddleOCR engine...")

    try:

        ocr_engine = PaddleOCR(

            # Language
            lang=lang,

            # New PaddleOCR orientation option
            use_textline_orientation=use_textline_orientation,

            # IMPORTANT:
            # Disable MKL-DNN/oneDNN CPU acceleration.
            # This avoids the inference error encountered on this setup.
            enable_mkldnn=False,

            # Explicitly use CPU
            device="cpu",

            # Reasonable CPU thread count
            cpu_threads=4
        )

    except Exception as init_error:

        print("\n[!] Failed to initialize PaddleOCR engine.")
        print(f"\n    {init_error}")

        print("\nPossible causes:")
        print("  - PaddlePaddle/PaddleOCR compatibility")
        print("  - Python version compatibility")
        print("  - Missing model dependencies")

        sys.exit(1)

    print("[+] PaddleOCR engine initialized successfully.")

    # ------------------------------------------------------------------------
    # 6. RUN OCR
    # ------------------------------------------------------------------------

    print()
    print(f"[+] Running OCR on '{path_obj.name}'...")
    print()

    try:

        results = ocr_engine.predict(str(path_obj))

    except Exception as ocr_error:

        print("\n[!] OCR inference failed.")
        print(f"\n    {ocr_error}")

        sys.exit(1)

    # ------------------------------------------------------------------------
    # 7. PROCESS RESULTS
    # ------------------------------------------------------------------------

    extracted_lines = []
    confidence_values = []

    print("=" * 80)
    print(" OCR RESULTS")
    print("=" * 80)

    result_count = 0

    for result in results:

        result_count += 1

        data = extract_result_data(result)

        if not data:
            continue

        # PaddleOCR usually stores actual OCR information inside "res"
        if isinstance(data, dict) and "res" in data:
            data = data["res"]

        if not isinstance(data, dict):
            continue

        # PaddleOCR 3.x fields
        texts = data.get("rec_texts", [])
        scores = data.get("rec_scores", [])

        if not texts:
            continue

        for index, detected_text in enumerate(texts):

            detected_text = str(detected_text).strip()

            if not detected_text:
                continue

            extracted_lines.append(detected_text)

            confidence = None

            if index < len(scores):

                try:
                    confidence = float(scores[index])

                except (ValueError, TypeError):
                    confidence = None

            # Print result
            number = len(extracted_lines)

            if confidence is not None:

                confidence_values.append(confidence)

                print(
                    f"{number:<4} "
                    f"{confidence:.2%}    "
                    f"{detected_text}"
                )

            else:

                print(
                    f"{number:<4} "
                    f"N/A        "
                    f"{detected_text}"
                )

    # ------------------------------------------------------------------------
    # 8. SUMMARY
    # ------------------------------------------------------------------------

    print("-" * 80)

    print(
        f"Detected Text Lines:      "
        f"{len(extracted_lines)}"
    )

    if confidence_values:

        average_confidence = (
            sum(confidence_values)
            / len(confidence_values)
        )

        print(
            f"Average OCR Confidence:   "
            f"{average_confidence:.2%}"
        )

    else:

        print("Average OCR Confidence:   N/A")

    # ------------------------------------------------------------------------
    # 9. COMBINED RAW TEXT
    # ------------------------------------------------------------------------

    print()
    print("=" * 80)
    print(" COMBINED RAW EXTRACTED TEXT")
    print("=" * 80)

    if extracted_lines:

        full_text = "\n".join(extracted_lines)

        print(full_text)

    else:

        print("[!] No text was extracted.")

    print("=" * 80)

    # ------------------------------------------------------------------------
    # 10. NEXT STEP
    # ------------------------------------------------------------------------

    print()
    print("Next Step:")
    print("  1. Raw OCR text")
    print("       ↓")
    print("  2. report_parser.py")
    print("       ↓")
    print("  3. Structured CBC data")
    print("       ↓")
    print("  4. cbc_validator.py")
    print("       ↓")
    print("  5. Validation result")

    print("=" * 80)


# ============================================================================
# COMMAND LINE
# ============================================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "CareFlow AI - "
            "PaddleOCR Medical Report Image Tester"
        )
    )

    parser.add_argument(
        "image_path",
        type=str,
        help="Path to the medical report image"
    )

    parser.add_argument(
        "--lang",
        type=str,
        default="en",
        help="OCR language (default: en)"
    )

    parser.add_argument(
        "--no-orientation",
        action="store_true",
        help="Disable textline orientation detection"
    )

    args = parser.parse_args()

    run_ocr(

        image_path=args.image_path,

        lang=args.lang,

        use_textline_orientation=(
            not args.no_orientation
        )
    )


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    main()