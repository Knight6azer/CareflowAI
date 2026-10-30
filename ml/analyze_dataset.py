"""
=============================================================================
CareFlow AI - Complete CBC Dataset Quality Analysis Script
=============================================================================
File: ml/analyze_dataset.py
Target Dataset: Dataset/careflow_cbc_clean.csv

Purpose:
    Perform an exploratory and data-quality analysis on the cleaned Complete
    Blood Count (CBC) dataset before any machine learning modeling begins.

    This script inspects:
    1. Dataset shape (number of records and features)
    2. Column names
    3. Data types
    4. Missing values (count and percentage per column)
    5. Duplicate rows
    6. Unique values for categorical variables (e.g., gender)
    7. Descriptive statistics for numerical features (count, mean, median, min, max, std)
    8. IQR-based statistical outlier detection for key blood and demographic features
    9. Actual rows containing potential statistical outliers
    10. Correlation matrix for numerical blood parameters

Important Clinical & Modeling Note:
    - Statistical outliers (e.g. values exceeding 1.5 * IQR) are NOT automatically
      data errors. In medical healthcare datasets, extreme values frequently represent
      acute clinical conditions (e.g., severe thrombocytopenia, leukocytosis, or thrombocytosis).
    - No data is modified or deleted.
    - No ML models are trained in this step.
=============================================================================
"""

import sys
from pathlib import Path
import pandas as pd


def get_dataset_path() -> Path:
    """
    Locates the dataset file reliably, whether this script is run from
    the project root directory or directly from the 'ml' folder.
    """
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent

    # Standard location relative to project root
    candidate_paths = [
        project_root / "Dataset" / "careflow_cbc_clean.csv",
        script_dir / ".." / "Dataset" / "careflow_cbc_clean.csv",
        Path("Dataset/careflow_cbc_clean.csv").resolve(),
    ]

    for path in candidate_paths:
        if path.exists():
            return path

    raise FileNotFoundError(
        "Could not locate 'careflow_cbc_clean.csv' in the Dataset directory. "
        "Please make sure you are running from the CareFlow AI project root."
    )


def print_section_header(title: str, number: int) -> None:
    """Helper function to print clear, formatted section headers."""
    divider = "=" * 80
    print(f"\n{divider}")
    print(f" {number}. {title.upper()}")
    print(f"{divider}")


def main() -> None:
    # -------------------------------------------------------------------------
    # Configure Pandas display settings for readable terminal output
    # -------------------------------------------------------------------------
    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", 1000)
    pd.set_option("display.precision", 2)

    # -------------------------------------------------------------------------
    # Load the cleaned CBC dataset
    # -------------------------------------------------------------------------
    dataset_path = get_dataset_path()
    print(f"\n[+] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    # =========================================================================
    # 1. Dataset Shape
    # =========================================================================
    print_section_header("Dataset Shape", 1)
    num_rows, num_cols = df.shape
    print(f"Total Rows (Patient records): {num_rows}")
    print(f"Total Columns (Features):     {num_cols}")
    print(f"Shape representation:         {df.shape}")

    # =========================================================================
    # 2. Column Names
    # =========================================================================
    print_section_header("Column Names", 2)
    for idx, col in enumerate(df.columns, start=1):
        print(f"  {idx}. {col}")

    # =========================================================================
    # 3. Data Types
    # =========================================================================
    print_section_header("Data Types", 3)
    dtypes_df = pd.DataFrame({
        "Column": df.columns,
        "Data Type": df.dtypes.astype(str).values
    })
    print(dtypes_df.to_string(index=False))

    # =========================================================================
    # 4. Missing-Value Count and Percentage for Every Column
    # =========================================================================
    print_section_header("Missing-Value Analysis", 4)
    missing_counts = df.isnull().sum()
    missing_percentages = (df.isnull().sum() / len(df)) * 100

    missing_df = pd.DataFrame({
        "Column": df.columns,
        "Missing Count": missing_counts.values,
        "Missing Percentage (%)": missing_percentages.values
    })
    # Sort with highest missing values first for quick inspection
    missing_df = missing_df.sort_values(by="Missing Count", ascending=False)
    print(missing_df.to_string(index=False))

    total_missing_cells = missing_counts.sum()
    print(f"\nTotal missing values across entire dataset: {total_missing_cells}")
    if total_missing_cells > 0:
        print("Note: In future ML stages, missing values should be handled using")
        print("      domain-appropriate imputation (e.g., median by age/gender groups).")
    else:
        print("Great! The dataset has zero missing values.")

    # =========================================================================
    # 5. Duplicate Row Count
    # =========================================================================
    print_section_header("Duplicate Row Count", 5)
    duplicate_count = df.duplicated().sum()
    print(f"Number of duplicate rows: {duplicate_count}")
    if duplicate_count > 0:
        print(f"Warning: Found {duplicate_count} duplicate records.")
    else:
        print("Confirmation: All patient records in the dataset are unique.")

    # =========================================================================
    # 6. Unique Values for Categorical Columns (e.g., Gender)
    # =========================================================================
    print_section_header("Categorical Columns Analysis", 6)

    # Identify object / categorical columns (including boolean flags for inspection)
    cat_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

    if not cat_cols:
        print("No categorical columns detected.")
    else:
        for col in cat_cols:
            unique_vals = df[col].dropna().unique().tolist()
            val_counts = df[col].value_counts(dropna=False)
            val_percs = df[col].value_counts(dropna=False, normalize=True) * 100

            print(f"\n--- Column: '{col}' ---")
            print(f"Number of unique categories: {len(unique_vals)}")
            print(f"Unique categories list:      {unique_vals}")
            print("\nDistribution breakdown:")

            breakdown_df = pd.DataFrame({
                "Category": val_counts.index.astype(str),
                "Count": val_counts.values,
                "Percentage (%)": val_percs.values
            })
            print(breakdown_df.to_string(index=False))

    # =========================================================================
    # 7. Descriptive Statistics for Numerical Columns
    # =========================================================================
    print_section_header("Descriptive Statistics for Numerical Columns", 7)

    # Numerical columns to analyze
    numerical_cols = [
        "age",
        "hemoglobin_g_dl",
        "wbc_count",
        "platelet_count",
        "platelet_distribution_width"
    ]
    # Filter to only those present in dataset
    valid_num_cols = [c for c in numerical_cols if c in df.columns]

    stats_dict = {
        "count": df[valid_num_cols].count(),
        "mean": df[valid_num_cols].mean(),
        "median": df[valid_num_cols].median(),
        "minimum": df[valid_num_cols].min(),
        "maximum": df[valid_num_cols].max(),
        "std_dev": df[valid_num_cols].std()
    }
    stats_df = pd.DataFrame(stats_dict)
    print("Table: Statistical Summary (count, mean, median, min, max, std):")
    print(stats_df.to_string())

    # =========================================================================
    # 8. Statistical Outlier Detection using the IQR Method
    # =========================================================================
    print_section_header("Statistical Outlier Detection (IQR Method)", 8)
    print("Explanation of the IQR (Interquartile Range) Method:")
    print("  - Q1 (25th percentile): 25% of data points fall below this value.")
    print("  - Q3 (75th percentile): 75% of data points fall below this value.")
    print("  - IQR = Q3 - Q1 (the spread of the middle 50% of values).")
    print("  - Lower Bound = Q1 - 1.5 * IQR")
    print("  - Upper Bound = Q3 + 1.5 * IQR")
    print("  - Any data point outside [Lower Bound, Upper Bound] is a statistical outlier.\n")

    outlier_summary = []
    outlier_indices_by_col = {}
    all_outlier_indices = set()

    for col in valid_num_cols:
        series = df[col].dropna()
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        # Find rows where value is outside bounds
        col_outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
        outlier_indices_by_col[col] = col_outliers.index.tolist()
        all_outlier_indices.update(col_outliers.index.tolist())

        outlier_summary.append({
            "Feature": col,
            "Q1 (25%)": round(q1, 2),
            "Q3 (75%)": round(q3, 2),
            "IQR": round(iqr, 2),
            "Lower Bound": round(lower_bound, 2),
            "Upper Bound": round(upper_bound, 2),
            "Outlier Count": len(col_outliers),
            "Outlier %": round((len(col_outliers) / len(df)) * 100, 2)
        })

    outlier_summary_df = pd.DataFrame(outlier_summary)
    print(outlier_summary_df.to_string(index=False))

    print("\n* Medical Context Note: Statistical outliers in blood metrics")
    print("  (e.g., platelet count > 337,250 / mcL or high PDW) often represent genuine")
    print("  clinical conditions (such as reactive thrombocytosis or severe infection)")
    print("  rather than data entry errors. They should not be dropped indiscriminately.")

    # =========================================================================
    # 9. Actual Rows Containing Possible Outliers
    # =========================================================================
    print_section_header("Actual Rows Containing Possible Outliers", 9)

    print(f"Total unique rows flagged with at least one outlier: {len(all_outlier_indices)}")

    # Show detailed breakdowns for each column that has outliers
    for col in valid_num_cols:
        idx_list = outlier_indices_by_col[col]
        print(f"\n>>> Column '{col}': {len(idx_list)} outlier row(s)")
        if idx_list:
            outlier_rows = df.loc[idx_list].copy()
            print(outlier_rows.to_string())
        else:
            print("    No outliers found for this feature.")

    # Combined summary table of all unique rows that contain an outlier
    print("\n>>> Combined Summary: All Unique Rows Containing at Least One Outlier:")
    sorted_all_outlier_idx = sorted(list(all_outlier_indices))
    combined_outliers_df = df.loc[sorted_all_outlier_idx].copy()

    # Add a helper column showing which column(s) caused the outlier flag
    def identify_flags(row_idx: int) -> str:
        flags = [col for col, indices in outlier_indices_by_col.items() if row_idx in indices]
        return ", ".join(flags)

    combined_outliers_df["outlier_in"] = [identify_flags(i) for i in sorted_all_outlier_idx]
    print(f"Displaying {len(combined_outliers_df)} total outlier rows with flagged columns:")
    print(combined_outliers_df.to_string())

    # =========================================================================
    # 10. Correlations Between Numerical Blood Parameters
    # =========================================================================
    print_section_header("Correlations Between Numerical Blood Parameters", 10)
    print("Pearson Correlation Matrix (-1.00 = perfect negative, +1.00 = perfect positive):")

    corr_matrix = df[valid_num_cols].corr()
    print("\n" + corr_matrix.to_string())

    print("\nKey Correlation Insights:")
    # Find top non-diagonal correlations
    corr_pairs = []
    for i in range(len(valid_num_cols)):
        for j in range(i + 1, len(valid_num_cols)):
            col1 = valid_num_cols[i]
            col2 = valid_num_cols[j]
            corr_val = corr_matrix.loc[col1, col2]
            corr_pairs.append((col1, col2, corr_val))

    # Sort by absolute correlation strength
    corr_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
    for col1, col2, val in corr_pairs:
        direction = "positive" if val > 0 else "negative"
        strength = (
            "strong" if abs(val) >= 0.7 else
            "moderate" if abs(val) >= 0.3 else
            "weak / negligible"
        )
        print(f"  - {col1} vs {col2}: {val:+.4f} ({strength} {direction} correlation)")

    # -------------------------------------------------------------------------
    # Final Summary & Next Steps Guidance
    # -------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print(" DATA QUALITY ANALYSIS COMPLETE")
    print("=" * 80)
    print("Summary of Key Findings:")
    print(f"  - Total records analyzed: {num_rows}")
    print(f"  - Missing values: Present in WBC ({missing_counts.get('wbc_count', 0)}), "
          f"Platelet ({missing_counts.get('platelet_count', 0)}), "
          f"PDW ({missing_counts.get('platelet_distribution_width', 0)}), "
          f"Hemoglobin ({missing_counts.get('hemoglobin_g_dl', 0)})")
    print(f"  - Duplicates: {duplicate_count} duplicate rows found")
    print(f"  - Unique rows with IQR outliers: {len(all_outlier_indices)} ({len(all_outlier_indices)/len(df)*100:.1f}%)")
    print("  - Medical Note: Outliers reflect real patient physiological variance;")
    print("    do not blindly discard them prior to clinical model development.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
