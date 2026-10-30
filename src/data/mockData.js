export const MOCK_REPORTS = [
  {
    id: "rpt-cbc-001",
    title: "Complete Blood Count (CBC)",
    type: "Blood Test",
    date: "24 Sept 2026",
    isoDate: "2026-09-24",
    status: "Analyzed",
    labName: "MetroHealth Diagnostics",
    doctorName: "Dr. Sarah Jenkins, MD",
    patientName: "Alex Morgan",
    pageCount: 2,
    summary: "Your CBC test indicates generally healthy blood cell counts. Your Hemoglobin levels are slightly below standard reference ranges, which might suggest mild iron deficiency or fatigue. All other primary markers including White Blood Cells and Platelets are within healthy limits.",
    parameters: [
      {
        name: "Hemoglobin",
        value: 11.2,
        unit: "g/dL",
        refRange: "12.0 – 16.0",
        minRef: 12.0,
        maxRef: 16.0,
        status: "Slightly Low",
        severity: "warning",
        description: "Hemoglobin is the protein in red blood cells that carries oxygen throughout your body."
      },
      {
        name: "WBC (White Blood Cells)",
        value: 6.8,
        unit: "x10³/µL",
        refRange: "4.5 – 11.0",
        minRef: 4.5,
        maxRef: 11.0,
        status: "Normal",
        severity: "normal",
        description: "White blood cells help your immune system fight off infections and diseases."
      },
      {
        name: "Platelets",
        value: 240,
        unit: "x10³/µL",
        refRange: "150 – 450",
        minRef: 150,
        maxRef: 450,
        status: "Normal",
        severity: "normal",
        description: "Platelets are blood cells that help your body form clots to stop bleeding."
      },
      {
        name: "RBC (Red Blood Cells)",
        value: 4.2,
        unit: "x10⁶/µL",
        refRange: "4.0 – 5.4",
        minRef: 4.0,
        maxRef: 5.4,
        status: "Normal",
        severity: "normal",
        description: "Red blood cells carry oxygen from your lungs to the rest of your body."
      },
      {
        name: "Fasting Glucose",
        value: 95,
        unit: "mg/dL",
        refRange: "70 – 99",
        minRef: 70,
        maxRef: 99,
        status: "Normal",
        severity: "normal",
        description: "Measures blood sugar levels after an overnight fast to assess metabolic health."
      }
    ],
    aiExplanation: {
      headline: "Understanding Your Hemoglobin & Overall Results",
      overview: "Your test results are overall reassuring with 4 out of 5 key markers in optimal range. The primary item of note is your Hemoglobin at 11.2 g/dL (normal range is 12.0–16.0 g/dL).",
      keyTakeaways: [
        "White Blood Cell count (6.8) shows no signs of active systemic infection.",
        "Platelet count (240) indicates normal blood clotting capacity.",
        "Slightly lower hemoglobin can cause mild tiredness or cold sensitivity in hands/feet."
      ],
      practicalAdvice: [
        "Consider increasing iron-rich foods in your diet (spinach, lentils, lean protein).",
        "Vitamin C aids iron absorption—try pairing meals with citrus or bell peppers.",
        "Mention this result at your next routine medical appointment for a quick follow-up."
      ],
      questionsForDoctor: [
        "Should I consider a dietary iron supplement or serum ferritin test?",
        "Could my recent tiredness be related to this hemoglobin reading?"
      ]
    }
  },
  {
    id: "rpt-lft-002",
    title: "Liver Function Panel (LFT)",
    type: "Blood Test",
    date: "18 Sept 2026",
    isoDate: "2026-09-18",
    status: "Analyzed",
    labName: "Apex Medical Laboratories",
    doctorName: "Dr. Robert Vance",
    patientName: "Alex Morgan",
    pageCount: 1,
    summary: "Your liver enzyme levels are mostly optimal. ALT enzyme level is slightly elevated above normal thresholds, which can occur after intense exercise, temporary medication use, or mild dietary changes.",
    parameters: [
      {
        name: "ALT (Alanine Transaminase)",
        value: 48,
        unit: "U/L",
        refRange: "7 – 45",
        minRef: 7,
        maxRef: 45,
        status: "Mildly Elevated",
        severity: "warning",
        description: "An enzyme found mainly in the liver that helps convert proteins into energy."
      },
      {
        name: "AST (Aspartate Aminotransferase)",
        value: 28,
        unit: "U/L",
        refRange: "8 – 40",
        minRef: 8,
        maxRef: 40,
        status: "Normal",
        severity: "normal",
        description: "An enzyme found in liver, heart, and muscle tissue."
      },
      {
        name: "Bilirubin (Total)",
        value: 0.8,
        unit: "mg/dL",
        refRange: "0.1 – 1.2",
        minRef: 0.1,
        maxRef: 1.2,
        status: "Normal",
        severity: "normal",
        description: "A byproduct formed during the breakdown of old red blood cells."
      },
      {
        name: "Albumin",
        value: 4.4,
        unit: "g/dL",
        refRange: "3.5 – 5.5",
        minRef: 3.5,
        maxRef: 5.5,
        status: "Normal",
        severity: "normal",
        description: "A protein produced by the liver that keeps fluid from leaking out of blood vessels."
      }
    ],
    aiExplanation: {
      headline: "Liver Panel Breakdown",
      overview: "Your liver function test shows strong baseline health. Bilirubin and Albumin are completely normal. ALT is marginally elevated at 48 U/L (reference limit 45 U/L).",
      keyTakeaways: [
        "Mild ALT elevation is common and often temporary.",
        "Normal Bilirubin and Albumin indicate the liver is functioning normally.",
        "AST-to-ALT ratio is in a healthy range."
      ],
      practicalAdvice: [
        "Stay well hydrated with 2-3 liters of water daily.",
        "Limit alcohol consumption for 1-2 weeks prior to any re-test.",
        "Avoid unnecessary over-the-counter painkillers like acetaminophen if possible."
      ],
      questionsForDoctor: [
        "Is a routine re-test recommended in 3 to 6 months?",
        "Could my recent workout routine influence my ALT level?"
      ]
    }
  },
  {
    id: "rpt-lipid-003",
    title: "Lipid & Cholesterol Profile",
    type: "Blood Test",
    date: "05 Aug 2026",
    isoDate: "2026-08-05",
    status: "Analyzed",
    labName: "MetroHealth Diagnostics",
    doctorName: "Dr. Sarah Jenkins, MD",
    patientName: "Alex Morgan",
    pageCount: 1,
    summary: "Your lipid profile reveals healthy HDL (good cholesterol) and Triglyceride levels. Total Cholesterol is slightly desirable, with LDL showing optimal heart-healthy markers.",
    parameters: [
      {
        name: "Total Cholesterol",
        value: 185,
        unit: "mg/dL",
        refRange: "< 200",
        minRef: 100,
        maxRef: 200,
        status: "Optimal",
        severity: "normal",
        description: "Total amount of cholesterol contained in your blood."
      },
      {
        name: "HDL (Good Cholesterol)",
        value: 58,
        unit: "mg/dL",
        refRange: "> 40",
        minRef: 40,
        maxRef: 80,
        status: "Optimal",
        severity: "normal",
        description: "Helps remove harmful LDL cholesterol from your arteries."
      },
      {
        name: "LDL (Bad Cholesterol)",
        value: 105,
        unit: "mg/dL",
        refRange: "< 100",
        minRef: 50,
        maxRef: 100,
        status: "Borderline",
        severity: "warning",
        description: "Can cause cholesterol buildup on artery walls if elevated."
      },
      {
        name: "Triglycerides",
        value: 110,
        unit: "mg/dL",
        refRange: "< 150",
        minRef: 40,
        maxRef: 150,
        status: "Normal",
        severity: "normal",
        description: "A type of fat stored in your body used for energy between meals."
      }
    ],
    aiExplanation: {
      headline: "Lipid Profile Insights",
      overview: "Great news on your cardiovascular health markers! Your HDL is protective at 58 mg/dL and triglycerides are well managed.",
      keyTakeaways: [
        "High HDL (58 mg/dL) provides a protective effect for heart health.",
        "Total cholesterol is comfortably below the 200 mg/dL threshold.",
        "LDL is just at 105 mg/dL, which is close to optimal target (< 100 mg/dL)."
      ],
      practicalAdvice: [
        "Continue dietary fiber intake through oats, legumes, and apples.",
        "Maintain regular aerobic exercise (30 mins 4 times a week)."
      ],
      questionsForDoctor: [
        "Is my current diet sufficient to keep LDL under 100 mg/dL?"
      ]
    }
  },
  {
    id: "rpt-thyroid-004",
    title: "Thyroid Stimulating Hormone (TSH)",
    type: "Hormone Panel",
    date: "12 May 2026",
    isoDate: "2026-05-12",
    status: "Analyzed",
    labName: "EndoCare Specialty Lab",
    doctorName: "Dr. Elena Rostova",
    patientName: "Alex Morgan",
    pageCount: 1,
    summary: "TSH level is well within normal range, indicating balanced thyroid gland activity.",
    parameters: [
      {
        name: "TSH",
        value: 2.1,
        unit: "mIU/L",
        refRange: "0.4 – 4.0",
        minRef: 0.4,
        maxRef: 4.0,
        status: "Normal",
        severity: "normal",
        description: "Controls the production of thyroid hormones that regulate metabolism."
      },
      {
        name: "Free T4",
        value: 1.3,
        unit: "ng/dL",
        refRange: "0.8 – 1.8",
        minRef: 0.8,
        maxRef: 1.8,
        status: "Normal",
        severity: "normal",
        description: "Active thyroid hormone circulating in the bloodstream."
      }
    ],
    aiExplanation: {
      headline: "Thyroid Function Evaluation",
      overview: "Your TSH of 2.1 mIU/L reflects normal metabolism and healthy thyroid hormone output.",
      keyTakeaways: [
        "Thyroid regulation is functioning smoothly.",
        "No evidence of hypo- or hyperthyroidism."
      ],
      practicalAdvice: [
        "Maintain adequate iodine intake through iodized salt and seafood."
      ],
      questionsForDoctor: [
        "When should I schedule routine thyroid screening next?"
      ]
    }
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Scan or Upload",
    description: "Upload a PDF/image or capture a report using your phone camera directly in your web browser."
  },
  {
    step: "02",
    title: "CareFlow AI Processes It",
    description: "Our structured text recognition model identifies key lab values, units, and reference ranges automatically."
  },
  {
    step: "03",
    title: "Understand Your Report",
    description: "Receive an easy-to-read, structured summary with plain-language explanations for every marker."
  }
];

export const FEATURE_CARDS = [
  {
    icon: "Camera",
    title: "Scan Reports",
    description: "Capture a medical report directly using your phone camera with automatic edge detection UI."
  },
  {
    icon: "FileText",
    title: "Extract Information",
    description: "Extract complex lab values, units, and reference ranges from uploaded images or PDF documents."
  },
  {
    icon: "Brain",
    title: "Understand Results",
    description: "Convert medical jargon into simple, patient-friendly explanations with action-oriented takeaways."
  },
  {
    icon: "ShieldCheck",
    title: "Secure & Private",
    description: "Your data is kept private with zero diagnostic retention. Built with strict privacy standards."
  }
];

export const ABOUT_SECTIONS = {
  purpose: "CareFlow AI was created to solve a widespread problem: patient confusion when reviewing complex medical lab reports. We bridge the communication gap by translating clinical measurements into clear, digestible, patient-focused explanations.",
  howItWorks: "Using advanced visual text extraction and natural language processing models, CareFlow AI parses unstructured lab documents into clean parameter cards, highlights out-of-range values, and delivers context-aware explanations.",
  technology: "Built with modern Web technologies, CareFlow AI is designed to integrate smoothly with FastAPI backend services, Tesseract/LayoutLM OCR pipelines, and HIPAA-compliant LLM inference servers.",
  privacy: "We prioritize patient privacy above all else. Mock data is used throughout this preview, and future backend architecture is designed with end-to-end encryption and anonymization protocols.",
  disclaimer: "CareFlow AI is designed solely for educational and informational purposes. It does not provide medical diagnoses, treatment recommendations, or clinical decisions. Always consult with a qualified doctor regarding your lab results."
};
