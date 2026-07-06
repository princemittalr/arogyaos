// ─── Health Vault Constants ──────────────────────────────────────────────────

export const VAULT_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  SUPERSEDED: 'SUPERSEDED',
} as const;

export type VaultStatus = typeof VAULT_STATUS[keyof typeof VAULT_STATUS];

export const VAULT_SOURCE = {
  CITIZEN: 'citizen',
  PROVIDER: 'provider',
  LABORATORY: 'laboratory',
  PHARMACY: 'pharmacy',
} as const;

export type VaultSource = typeof VAULT_SOURCE[keyof typeof VAULT_SOURCE];

export const FHIR_RESOURCE_TYPES = {
  PRESCRIPTION: 'MedicationRequest',
  LAB_REPORT: 'DiagnosticReport',
  VACCINATION: 'Immunization',
  DISCHARGE_SUMMARY: 'Composition',
  MEDICAL_CERTIFICATE: 'DocumentReference',
  CONSULTATION: 'Encounter',
} as const;

export type FhirResourceType = typeof FHIR_RESOURCE_TYPES[keyof typeof FHIR_RESOURCE_TYPES];

export const FHIR_CONFIG = {
  DEFAULT_VERSION: 'R4B',
  HASH_ALGORITHM: 'SHA-256',
  CHECKSUM_VERSION: '1.0.0',
} as const;
