export const FHIR_VERSIONS = ['STU3', 'R4', 'R5'] as const;
export const HL7_VERSIONS = ['V2.3', 'V2.5', 'V2.7', 'V3'] as const;
export const CDA_VERSIONS = ['R2', 'R3'] as const;
export const DICOM_VERSIONS = ['3.0'] as const;
export const TERMINOLOGY_STANDARDS = ['ICD-10', 'SNOMED-CT', 'LOINC', 'RxNorm', 'UCUM'] as const;
export const EXCHANGE_PROTOCOLS = ['REST', 'SOAP', 'MLLP', 'SFTP'] as const;
export const VALIDATION_MODES = ['STRICT', 'LENIENT', 'WARNING_ONLY'] as const;
export const SYNCHRONIZATION_MODES = ['REALTIME', 'BATCH', 'SCHEDULED', 'MANUAL'] as const;

export const HEALTHCARE_STANDARDS = {
  FHIR: FHIR_VERSIONS,
  HL7: HL7_VERSIONS,
  CDA: CDA_VERSIONS,
  DICOM: DICOM_VERSIONS,
  TERMINOLOGY: TERMINOLOGY_STANDARDS
};
