export const SPECIMEN_TYPES = [
  'Blood',
  'Urine',
  'Saliva',
  'Sputum',
  'Serum',
  'Plasma',
  'Swab'
] as const;

export interface TestCatalogItem {
  parameter: string;
  unit: string;
  referenceRange: string;
  low: number;
  high: number;
}

export const TEST_CATALOGS: Record<string, TestCatalogItem[]> = {
  'Complete Blood Count (CBC)': [
    { parameter: 'Hemoglobin', unit: 'g/dL', referenceRange: '13.5 - 17.5', low: 13.5, high: 17.5 },
    { parameter: 'WBC', unit: '/mcL', referenceRange: '4,500 - 11,000', low: 4500, high: 11000 },
    { parameter: 'Platelets', unit: '/mcL', referenceRange: '150,000 - 450,000', low: 150000, high: 450000 }
  ],
  'Lipid Profile': [
    { parameter: 'Cholesterol', unit: 'mg/dL', referenceRange: '100 - 199', low: 100, high: 199 },
    { parameter: 'Triglycerides', unit: 'mg/dL', referenceRange: '30 - 149', low: 30, high: 149 },
    { parameter: 'HDL', unit: 'mg/dL', referenceRange: '40 - 60', low: 40, high: 60 }
  ],
  'Thyroid Profile': [
    { parameter: 'TSH', unit: 'uIU/mL', referenceRange: '0.4 - 4.5', low: 0.4, high: 4.5 },
    { parameter: 'Free T3', unit: 'pg/mL', referenceRange: '2.0 - 4.4', low: 2.0, high: 4.4 },
    { parameter: 'Free T4', unit: 'ng/dL', referenceRange: '0.8 - 1.8', low: 0.8, high: 1.8 }
  ],
  'Liver Function Test (LFT)': [
    { parameter: 'ALT', unit: 'U/L', referenceRange: '7 - 56', low: 7, high: 56 },
    { parameter: 'AST', unit: 'U/L', referenceRange: '10 - 40', low: 10, high: 40 },
    { parameter: 'Bilirubin', unit: 'mg/dL', referenceRange: '0.2 - 1.2', low: 0.2, high: 1.2 }
  ],
  'Kidney Function Test (KFT)': [
    { parameter: 'Urea', unit: 'mg/dL', referenceRange: '7 - 20', low: 7, high: 20 },
    { parameter: 'Creatinine', unit: 'mg/dL', referenceRange: '0.6 - 1.2', low: 0.6, high: 1.2 }
  ]
};
