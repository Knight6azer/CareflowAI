# CareFlow AI - OCR & CBC Report Parsing Prototype

Welcome to the **CareFlow AI** OCR prototype. This module extracts raw text from laboratory report images or PDFs and parses them into structured Complete Blood Count (CBC) parameters.

---

## 1. Architectural Pipeline

The complete CareFlow AI pipeline connects document image processing directly to clinical explanation:

```
[Patient CBC Report Image/PDF]
              │
              ▼
    [PaddleOCR Engine]              (ml/ocr/ocr_test.py)
   Extracts text & confidence
              │
              ▼
  [Raw Multi-Line Text]
              │
              ▼
   [Report Parser Engine]           (ml/ocr/report_parser.py)
   Regex tokenization & extraction of:
   - Test Names & Aliases
   - Numerical Results
   - Units (g/dL, /cumm, %, fL, pg)
   - Extracted Reference Ranges
              │
              ▼
    [Structured CBCRecord]          (ml/cbc_schema.py)
              │
              ▼
     [CBC Validator]                (ml/cbc_validator.py)
   Integrity, bounds & outlier review
              │
              ▼
[Report Reference-Range Comparison] (Future: report-specific bounds)
              │
              ▼
 [Patient-Friendly Explanation]     (Future: clinical communication)
```

---

## 2. Supported CBC Parameters

The parser supports 16 foundational and differential CBC parameters, accounting for varied laboratory aliases and abbreviations:

| Parameter | Standard Name | Common Lab Aliases / Abbreviations | Typical Units |
| :--- | :--- | :--- | :--- |
| **Hemoglobin** | Hemoglobin | Hb, HGB, Haemoglobin, H.B. | `g/dL`, `gm/dl`, `g%`, `mg/dL` |
| **Red Blood Cells** | RBC Count | Total RBC Count, RBC, R.B.C., Erythrocytes | `million/μL`, `mil/uL`, `10^6/uL` |
| **Hematocrit** | Hematocrit | Packed Cell Volume, PCV, P.C.V., HCT | `%` |
| **Mean Corpuscular Volume** | MCV | M.C.V., Mean Corpuscular Volume | `fL`, `fl` |
| **Mean Corpuscular Hemoglobin** | MCH | M.C.H., Mean Corpuscular Haemoglobin | `pg` |
| **MCHC** | MCHC | M.C.H.C., Mean Corpuscular Hb Conc. | `g/dL`, `%` |
| **Red Cell Distribution Width** | RDW-CV | RDW, R.D.W., RDW-CV, Red Cell Distribution Width | `%` |
| **White Blood Cells** | WBC Count | Total WBC Count, Total Leukocyte Count, TLC, W.B.C. | `/μL`, `/µL`, `/cumm`, `cells/mcL` |
| **Neutrophils** | Neutrophils | Neutrophils, Segs, Segmented Neutrophils, Polymorphs | `%` |
| **Lymphocytes** | Lymphocytes | Lymphocytes, Lymphs, Absolute Lymphocytes | `%` |
| **Monocytes** | Monocytes | Monocytes, Monos, Absolute Monocytes | `%` |
| **Eosinophils** | Eosinophils | Eosinophils, Eos, Absolute Eosinophils | `%` |
| **Basophils** | Basophils | Basophils, Basos, Absolute Basophils | `%` |
| **Platelets** | Platelet Count | Platelets, PLT, Total Platelet Count, P.L.T. | `/μL`, `/µL`, `/cumm`, `cells/mcL` |
| **Platelet Distribution Width** | PDW | PDW, P.D.W., Platelet Distribution Width | `%`, `fL` |
| **Mean Platelet Volume** | MPV | MPV, M.P.V., Mean Platelet Volume | `fL` |

---

## 3. How to Install PaddleOCR

PaddleOCR requires the `paddlepaddle` deep learning framework and the `paddleocr` toolkit.

### Standard Installation (CPU):
Open your terminal and run:

```bash
pip install paddlepaddle paddleocr
```

### Windows & GPU Notes:
- For standard development and CPU execution on Windows, the above command works out of the box.
- If you have an NVIDIA GPU and wish to leverage CUDA acceleration, refer to the [official PaddlePaddle installation guide](https://www.paddlepaddle.org.cn/en/install/quick) to select the matching CUDA version.
- On Windows, if you encounter visual C++ runtime errors, ensure the **Microsoft Visual C++ Redistributable** is up to date.

---

## 4. How to Run the OCR Test

Once PaddleOCR is installed, you can run OCR inference on any local medical report image:

```bash
python ml/ocr/ocr_test.py path/to/report_image.jpg
```

### Options:
- `--lang en`: Set OCR language model (default: `'en'`).
- `--no-cls`: Disable page orientation angle classification if the image is already upright.

### What `ocr_test.py` does:
1. Validates that the image file exists.
2. Checks whether PaddleOCR is installed (printing clean installation instructions if missing).
3. Executes text detection and recognition on the image.
4. Prints each detected text line alongside its OCR confidence score (e.g. `98.40%`).
5. Displays the consolidated raw text block ready to feed into `report_parser.py`.

---

## 5. How to Run the Report Parser Test Suite

You can test the parser **immediately without needing a physical image file or PaddleOCR installation**. The parser contains a built-in test suite with synthetic laboratory reports (including standard tabular formats, noisy OCR text with split decimals, and incomplete reports):

```bash
python ml/ocr/report_parser.py
```

---

## 6. How OCR Connects to `report_parser.py` and `cbc_validator.py`

### Step 1: Raw OCR $\rightarrow$ `report_parser.py`
The raw lines returned by `PaddleOCR` are passed into `parse_cbc_report_text(raw_text)`:
```python
from ml.ocr.report_parser import parse_cbc_report_text

raw_ocr_output = """
Hemoglobin 14.2 g/dL 13.0 - 17.0
Total Leukocyte Count (TLC) 7,500 /cumm 4,000 - 11,000
Platelet Count 225,000 /cumm 150,000 - 450,000
"""

parsed_report = parse_cbc_report_text(raw_ocr_output)
```

### Step 2: `report_parser.py` $\rightarrow$ `cbc_validator.py`
The parsed report converts into a standardized `CBCRecord` using `.to_cbc_record()` and is validated against biological plausibility and statistical outlier fences:
```python
from ml.cbc_validator import validate_cbc_record

# Convert parsed report into standard schema
cbc_record = parsed_report.to_cbc_record()

# Validate numeric integrity, missingness, and statistical bounds
validation_result = validate_cbc_record(cbc_record)

print("Validation Status:", validation_result.overall_status.value)
# Possible statuses: VALID, MISSING, INVALID, OUTLIER_REVIEW
```

---

## 7. Important Safety & Clinical Principles

1. **No Disease Diagnosis**: This module only extracts and cleans laboratory text. It does not diagnose, predict, or label any clinical disease (such as dengue or anemia).
2. **Laboratory-Specific Reference Ranges**: Clinical reference ranges vary by laboratory analyzer, reagent formulation, and demographic baselines. `report_parser.py` extracts the reference interval directly printed on the patient's own report rather than comparing against hard-coded universal ranges.
3. **OCR Noise Tolerance**: The parser automatically repairs common OCR artifacts:
   - Split decimals (e.g., `"14 . 2"` $\rightarrow 14.2$)
   - Indian and Western comma separators (e.g., `"1,85,000"` or `"185,000"` $\rightarrow 185000.0$)
   - Dotted acronyms (`R.B.C.`, `W.B.C.`, `P.C.V.`)
   - Spacing anomalies and casing differences (`HEMOGLOBIN`, `Haemoglobin`, `hb`)
4. **Preservation of Clinical Outliers**: Values outside statistical IQR fences (e.g. Platelets > 337,250 / mcL) are assigned `OUTLIER_REVIEW`. They are **never automatically deleted**, as severe medical conditions (such as acute infection or thrombocytosis) naturally present with extreme values.
