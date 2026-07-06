import { VaultStatus, VaultSource, FhirResourceType } from '../core/constants';

export interface VaultOrigin {
  deviceId: string;
  deviceType: string;
  platform: string;
  browser: string;
  appVersion: string;
}

export interface VaultVerification {
  isVerified: boolean;
  verifiedBy?: string;
  signature?: string;
}

export interface VaultInteroperability {
  resourceType: FhirResourceType;
  fhirVersion: string;
  hashAlgorithm: string;
  checksumVersion: string;
}

export interface VaultMetadata {
  createdAt: unknown; // Firestore Timestamp or ISO String depending on serialization context
  updatedAt: unknown;
  createdBy: string;
  updatedBy: string;
  version: number;
  status: VaultStatus;
  source: VaultSource;
  ownerId: string; // Canonical ownership field for future caregiver, guardian, and family sharing
  origin: VaultOrigin;
  verification: VaultVerification;
  interoperability: VaultInteroperability;
  checksum: string; // SHA-256 hash generated server-side ONLY after validation
}

export interface TimelineIndexEntry {
  indexId: string; // Sortable unique ID (ULID)
  patientId: string; // Matches ownerId
  recordType: 'prescription' | 'lab_report' | 'vaccination' | 'discharge_summary' | 'medical_certificate' | 'consultation' | 'radiology_report';
  recordId: string; // Pointer to concrete document in specific collection
  encounterDate: unknown; // Firestore Timestamp for sorting
  summaryFields: {
    title: string;
    providerName: string;
    hospitalName: string;
    status: VaultStatus;
  };
  metadata: VaultMetadata;
  aiSummaryCache?: string; // Optional field reserved for downstream AI summaries
}

export interface BaseVaultRecord {
  recordId: string;
  ownerId: string;
  metadata: VaultMetadata;
}

export interface PrescriptionRecord extends BaseVaultRecord {
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  encounterId?: string;
  diagnosis: string;
  medicines: Array<{
    medicineId: string;
    name: string;
    dosage: string; // e.g. "1-0-1"
    frequency: string; // e.g. "after-meal"
    durationDays: number;
    instructions?: string;
  }>;
  refillsAllowed: number;
  notes?: string;
}

export interface LabObservation {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  status: 'preliminary' | 'final' | 'corrected';
}

export interface LabReportRecord extends BaseVaultRecord {
  testName: string;
  laboratoryId: string;
  laboratoryName: string;
  technicianId: string;
  technicianName: string;
  observations: LabObservation[];
  attachmentUrl?: string; // Firebase Storage URL
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
}

export interface VaccinationRecord extends BaseVaultRecord {
  vaccineName: string;
  doseNumber: number;
  totalDoses: number;
  batchNumber: string;
  manufacturer: string;
  administeredBy: string;
  facilityName: string;
  nextDueDate?: unknown;
}

export interface DischargeSummaryRecord extends BaseVaultRecord {
  hospitalId: string;
  hospitalName: string;
  admissionDate: unknown;
  dischargeDate: unknown;
  admittingDiagnosis: string;
  dischargeDiagnosis: string;
  treatmentSummary: string;
  dischargeCondition: string;
  followUpPlan: string;
  attendingPhysicianId: string;
  attendingPhysicianName: string;
}

export interface MedicalCertificateRecord extends BaseVaultRecord {
  doctorId: string;
  doctorName: string;
  facilityName: string;
  purpose: string;
  startDate: unknown;
  endDate: unknown;
  diagnosisNotes?: string;
  fitnessStatus: 'unfit' | 'fit' | 'fit_with_restrictions';
}

export interface ConsultationRecord extends BaseVaultRecord {
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  encounterType: 'general' | 'emergency' | 'specialist' | 'telehealth';
  symptoms: string[];
  clinicalNotes: string;
  provisionalDiagnosis: string;
  plan: string;
}
