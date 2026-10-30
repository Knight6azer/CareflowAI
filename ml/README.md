# CareFlow AI - Structured CBC Processing & Validation Layer

Welcome to the **CareFlow AI** machine learning and data processing foundation. This directory manages data quality analysis, structured schema representations, and robust clinical validation for Complete Blood Count (CBC) reports.

---

## 1. Pipeline Overview

CareFlow AI follows a patient-first, transparent clinical interpretation pipeline:

```
[CBC Report Image/PDF]
         │
         ▼
       [OCR]  (Optical Character Recognition extraction)
         │
         ▼
[Structured CBC Values]  (cbc_schema.py: CBCRecord)
         │
         ▼
   [Data Validation]  (cbc_validator.py)
         │
         ▼
[Reference-Range Comparison]  (Extracted from patient's lab report)
         │
         ▼
[Patient-Friendly Explanation]  (Clear, contextual health literacy summary)
```

---

## 2. Core Modules in `ml/`

| File | Purpose |
| :--- | :--- |
| [`cbc_schema.py`](cbc_schema.py) | Typed data structures (`CBCRecord`, `FieldValidationResult`, `CBCValidationResult`) and validation status enumerations. |
| [`cbc_validator.py`](cbc_validator.py) | Non-diagnostic data validator checking numeric integrity, missingness, physical limits, and statistical outlier review. Includes a built-in test suite. |
| [`analyze_dataset.py`](analyze_dataset.py) | Exploratory data quality audit script analyzing `Dataset/careflow_cbc_clean.csv`. |

---

## 3. Key Design Decisions

### A. Why We Use Validation
When extracting medical data from unstructured documents (such as smartphone camera photos of paper lab sheets or scanned PDFs), OCR can introduce noise, such as:
- Misinterpreting numbers (e.g., reading `"14O,OOO"` instead of `"140,000"` or placing misplaced decimal points).
- Reading table headers as numeric values.
- Generating negative values or missing fields due to blur or folds in paper reports.

The validation layer acts as a strict **quality firewall** before any downstream interpretation occurs, ensuring invalid entries or missing parameters are caught before they reach the patient or doctor.

### B. Why We Are Not Using the Dengue Label
1. **Absence in Cleaned Dataset**: The cleaned dataset (`Dataset/careflow_cbc_clean.csv`) does not contain a dengue label and it must not be artificially added.
2. **Clinical Safety & Medical Ethics**: A standard Complete Blood Count (CBC) **cannot diagnose dengue fever** (or any specific viral infection) on its own. While viral illnesses can cause thrombocytopenia (low platelets) and leukopenia (low WBCs), these findings are non-specific and occur in malaria, typhoid, sepsis, influenza, drug reactions, and autoimmune disorders. Definitive dengue diagnosis requires serology (NS1 antigen or IgM/IgG antibodies) or PCR testing. Claiming CBC alone diagnoses dengue would be clinically irresponsible and hazardous.

### C. Why Statistical Outliers are Flagged Rather than Automatically Deleted
Standard statistical formulas (such as the $1.5 \times IQR$ method) flag values that fall in the tails of the distribution. However, in medicine:
- A platelet count of `410,000 / mcL` or PDW of `53%` is statistically unusual, but physiologically real (e.g. secondary reactive thrombocytosis due to inflammation or infection).
- A WBC count of `1,800 / mcL` is statistically rare, but clinically vital (severe leukopenia requiring protective isolation).

Automatically discarding or imputing these values would erase the very acute cases that healthcare providers most need to see. Therefore, CareFlow AI assigns an **`OUTLIER_REVIEW`** status—preserving the record, highlighting the anomaly, and prompting human clinical review.

### D. Why Reference Ranges Should Preferably Come from the Patient's Own Report
Universal reference ranges do not exist across all laboratories. Normal ranges vary substantially depending on:
- Laboratory equipment and analyzer manufacturer (e.g. Sysmex, Beckman Coulter, Mindray).
- Reagent chemical formulations.
- Local geographic calibration and demographic baselines.

Hard-coding universal reference ranges creates false alarms or false reassurances. In future pipeline stages, reference ranges should be extracted directly from the reference interval column on the patient's own lab report whenever available.

### E. How this Layer Connects to OCR and the FastAPI Backend
1. **OCR Stage**: A user uploads an image/PDF. The OCR service parses the text and extracts key-value pairs into a Python dictionary.
2. **Schema Ingestion**: The dictionary is converted into a `CBCRecord` via `CBCRecord.from_dict(...)`.
3. **Validation**: `validate_cbc_record(...)` processes the record and produces a `CBCValidationResult`.
4. **FastAPI Endpoint Integration**:
   - `CBCRecord` and `CBCValidationResult` serialize directly to JSON using `.to_dict()`.
   - If the status is `INVALID`, FastAPI immediately returns an HTTP 422 with actionable guidance (e.g. "Blurry photo: please retake image with good lighting").
   - If `MISSING`, the frontend can prompt the user to confirm whether a specific test was ordered.
   - If `VALID` or `OUTLIER_REVIEW`, the payload proceeds safely to the report reference-range comparator and explanation engine.

---

## 4. How to Run the Scripts

### Run the CBC Validator & Built-in Test Suite:
From the project root:
```powershell
python ml/cbc_validator.py
```

### Run the Initial Dataset Quality Analysis:
From the project root:
```powershell
python ml/analyze_dataset.py
```

*(Both scripts also run directly from within the `ml/` folder).*
