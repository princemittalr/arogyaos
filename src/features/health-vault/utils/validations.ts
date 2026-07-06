import { z } from 'zod';
import { VAULT_STATUS, VAULT_SOURCE, FHIR_RESOURCE_TYPES } from '../core/constants';

// Flexible Timestamp validation supporting JS Date, ISO Datetime, or Firestore Timestamps
export const TimestampSchema = z.union([
  z.date(),
  z.string().datetime(),
  z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }),
]);

export const VaultOriginSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceType: z.string().min(1, 'Device type is required'),
  platform: z.string().min(1, 'Platform is required'),
  browser: z.string().min(1, 'Browser is required'),
  appVersion: z.string().min(1, 'App version is required'),
});

export const VaultVerificationSchema = z.object({
  isVerified: z.boolean(),
  verifiedBy: z.string().optional(),
  signature: z.string().optional(),
});

export const VaultInteroperabilitySchema = z.object({
  resourceType: z.nativeEnum(FHIR_RESOURCE_TYPES),
  fhirVersion: z.string().min(1, 'FHIR version is required'),
  hashAlgorithm: z.string().min(1, 'Hash algorithm is required'),
  checksumVersion: z.string().min(1, 'Checksum version is required'),
});

export const VaultMetadataSchema = z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  createdBy: z.string().min(1, 'Creator UID is required'),
  updatedBy: z.string().min(1, 'Updater UID is required'),
  version: z.number().int().min(1),
  status: z.nativeEnum(VAULT_STATUS),
  source: z.nativeEnum(VAULT_SOURCE),
  ownerId: z.string().min(1, 'Owner ID is required'),
  origin: VaultOriginSchema,
  verification: VaultVerificationSchema,
  interoperability: VaultInteroperabilitySchema,
  checksum: z.string().min(1, 'Checksum is required'), // SHA-256 checksum server-side only
});

export const TimelineIndexEntrySchema = z.object({
  indexId: z.string().length(26, 'ULID must be exactly 26 characters'),
  patientId: z.string().min(1, 'Patient ID is required'),
  recordType: z.enum([
    'prescription',
    'lab_report',
    'vaccination',
    'discharge_summary',
    'medical_certificate',
    'consultation',
  ]),
  recordId: z.string().min(1, 'Record ID pointer is required'),
  encounterDate: TimestampSchema,
  summaryFields: z.object({
    title: z.string().min(1, 'Title is required').max(100),
    providerName: z.string().min(1, 'Provider name is required').max(100),
    hospitalName: z.string().min(1, 'Hospital name is required').max(100),
    status: z.nativeEnum(VAULT_STATUS),
  }),
  metadata: VaultMetadataSchema,
  aiSummaryCache: z.string().max(1000).optional(),
});

export const BaseVaultRecordSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  metadata: VaultMetadataSchema,
});

export const PrescriptionMedicineSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  durationDays: z.number().int().positive('Duration must be positive'),
  instructions: z.string().optional(),
});

export const PrescriptionRecordSchema = BaseVaultRecordSchema.extend({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  hospitalName: z.string().min(1, 'Hospital name is required'),
  encounterId: z.string().optional(),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  medicines: z.array(PrescriptionMedicineSchema).nonempty('Prescription must contain at least one medicine'),
  refillsAllowed: z.number().int().nonnegative(),
  notes: z.string().optional(),
});

export const LabObservationSchema = z.object({
  parameter: z.string().min(1, 'Parameter name is required'),
  value: z.string().min(1, 'Observation value is required'),
  unit: z.string().min(1, 'Unit is required'),
  referenceRange: z.string().min(1, 'Reference range is required'),
  isAbnormal: z.boolean(),
  status: z.enum(['preliminary', 'final', 'corrected']),
});

export const LabReportRecordSchema = BaseVaultRecordSchema.extend({
  testName: z.string().min(1, 'Test name is required'),
  laboratoryId: z.string().min(1, 'Laboratory ID is required'),
  laboratoryName: z.string().min(1, 'Laboratory name is required'),
  technicianId: z.string().min(1, 'Technician ID is required'),
  technicianName: z.string().min(1, 'Technician name is required'),
  observations: z.array(LabObservationSchema),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
  attachmentSize: z.number().int().positive().optional(),
  attachmentMimeType: z.string().optional(),
});

export const VaccinationRecordSchema = BaseVaultRecordSchema.extend({
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  doseNumber: z.number().int().positive(),
  totalDoses: z.number().int().positive(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  administeredBy: z.string().min(1, 'Administrator name is required'),
  facilityName: z.string().min(1, 'Facility name is required'),
  nextDueDate: TimestampSchema.optional(),
});

export const DischargeSummaryRecordSchema = BaseVaultRecordSchema.extend({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  hospitalName: z.string().min(1, 'Hospital name is required'),
  admissionDate: TimestampSchema,
  dischargeDate: TimestampSchema,
  admittingDiagnosis: z.string().min(1, 'Admitting diagnosis is required'),
  dischargeDiagnosis: z.string().min(1, 'Discharge diagnosis is required'),
  treatmentSummary: z.string().min(1, 'Treatment summary is required'),
  dischargeCondition: z.string().min(1, 'Discharge condition is required'),
  followUpPlan: z.string().min(1, 'Follow up plan is required'),
  attendingPhysicianId: z.string().min(1, 'Attending physician ID is required'),
  attendingPhysicianName: z.string().min(1, 'Attending physician name is required'),
});

export const MedicalCertificateRecordSchema = BaseVaultRecordSchema.extend({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  facilityName: z.string().min(1, 'Facility name is required'),
  purpose: z.string().min(1, 'Purpose of certificate is required'),
  startDate: TimestampSchema,
  endDate: TimestampSchema,
  diagnosisNotes: z.string().optional(),
  fitnessStatus: z.enum(['unfit', 'fit', 'fit_with_restrictions']),
});

export const ConsultationRecordSchema = BaseVaultRecordSchema.extend({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  hospitalName: z.string().min(1, 'Hospital name is required'),
  encounterType: z.enum(['general', 'emergency', 'specialist', 'telehealth']),
  symptoms: z.array(z.string()).nonempty('Must list at least one symptom'),
  clinicalNotes: z.string().min(1, 'Clinical notes are required'),
  provisionalDiagnosis: z.string().min(1, 'Provisional diagnosis is required'),
  plan: z.string().min(1, 'Management plan is required'),
});
