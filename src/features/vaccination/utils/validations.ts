import { z } from 'zod';
import { TimestampSchema } from '@/features/health-vault/utils/validations';
import {
  VACCINATION_STATUS,
  VACCINATION_CATEGORY,
  ADMINISTRATION_ROUTES,
  ADMINISTRATION_SITES,
  CERTIFICATE_TYPES,
  SEVERITY_LEVELS,
} from '../core/constants';

// ─── Enums ───────────────────────────────────────────────────────────

export const VaccinationStatusSchema = z.nativeEnum(VACCINATION_STATUS);

export const VaccinationCategorySchema = z.nativeEnum(VACCINATION_CATEGORY);

export const AdministrationRouteSchema = z.nativeEnum(ADMINISTRATION_ROUTES);

export const AdministrationSiteSchema = z.nativeEnum(ADMINISTRATION_SITES);

export const CertificateTypeSchema = z.nativeEnum(CERTIFICATE_TYPES);

export const SeverityLevelSchema = z.nativeEnum(SEVERITY_LEVELS);

// ─── AdverseEvent ────────────────────────────────────────────────────

export const AdverseEventSchema = z.object({
  reportedAt: TimestampSchema,
  reportedBy: z.string().min(1, 'Reporter ID is required'),
  symptoms: z.array(z.string().min(1, 'Symptom description is required')).nonempty('At least one symptom is required'),
  severity: SeverityLevelSchema,
  actionTaken: z.string().optional(),
  outcome: z.string().optional(),
  reporterName: z.string().min(2, 'Reporter name is required'),
  reporterContact: z.string().optional(),
  facilityName: z.string().optional(),
  isReportedToAuthority: z.boolean(),
  authorityReportId: z.string().optional(),
});

// ─── Vaccine ─────────────────────────────────────────────────────────

export const VaccineSchema = z.object({
  vaccineId: z.string().min(1, 'Vaccine ID is required'),
  name: z.string().min(1, 'Vaccine name is required'),
  code: z.string().min(1, 'Vaccine code is required'),
  diseaseTargeted: z.string().min(1, 'Target disease is required'),
  category: VaccinationCategorySchema,
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  totalDoses: z.number().int().positive('Total doses must be greater than 0'),
  doseIntervalDays: z.array(z.number().int().nonnegative()).nonempty('Dose intervals are required'),
  administrationRoute: AdministrationRouteSchema,
  administrationSite: AdministrationSiteSchema,
  storageRequirements: z.string().optional(),
  contraindications: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

// ─── Dose ────────────────────────────────────────────────────────────

export const DoseSchema = z.object({
  doseId: z.string().min(1, 'Dose ID is required'),
  vaccinationId: z.string().min(1, 'Vaccination ID is required'),
  doseNumber: z.number().int().positive('Dose number must be greater than 0'),
  administeredAt: TimestampSchema,
  administeredBy: z.string().min(1, 'Administrator ID is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  lotNumber: z.string().min(1, 'Lot number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  expiryDate: TimestampSchema,
  administrationRoute: AdministrationRouteSchema,
  administrationSite: AdministrationSiteSchema,
  adverseEvent: AdverseEventSchema.optional(),
});

// ─── Schedule ────────────────────────────────────────────────────────

export const ScheduleSchema = z.object({
  scheduleId: z.string().min(1, 'Schedule ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  diseaseTargeted: z.string().min(1, 'Target disease is required'),
  category: VaccinationCategorySchema,
  status: VaccinationStatusSchema,
  dueDate: TimestampSchema,
  scheduledDate: TimestampSchema,
  doseNumber: z.number().int().positive('Dose number must be greater than 0'),
  totalDoses: z.number().int().positive('Total doses must be greater than 0'),
  notes: z.string().optional(),
  metadata: z.object({
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
    createdBy: z.string().min(1, 'Creator UID is required'),
    updatedBy: z.string().min(1, 'Updater UID is required'),
    version: z.number().int().min(1),
    status: z.string(),
    source: z.string(),
    ownerId: z.string().min(1, 'Owner ID is required'),
    origin: z.object({
      deviceId: z.string(),
      deviceType: z.string(),
      platform: z.string(),
      browser: z.string(),
      appVersion: z.string(),
    }),
    verification: z.object({
      isVerified: z.boolean(),
      verifiedBy: z.string().optional(),
      signature: z.string().optional(),
    }),
    interoperability: z.object({
      resourceType: z.string(),
      fhirVersion: z.string(),
      hashAlgorithm: z.string(),
      checksumVersion: z.string(),
    }),
    checksum: z.string(),
  }),
});

// ─── Certificate ─────────────────────────────────────────────────────

export const CertificateSchema = z.object({
  certificateId: z.string().min(1, 'Certificate ID is required'),
  vaccinationId: z.string().min(1, 'Vaccination ID is required'),
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  certificateType: CertificateTypeSchema,
  qrCodeData: z.string().min(1, 'QR code data is required'),
  generatedAt: TimestampSchema,
  generatedBy: z.string().min(1, 'Generator ID is required'),
  pdfUrl: z.string().url().optional(),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  diseaseTargeted: z.string().min(1, 'Target disease is required'),
  doseNumber: z.number().int().positive(),
  totalDoses: z.number().int().positive(),
  administeredAt: TimestampSchema,
  administeredBy: z.string().min(1, 'Administrator name is required'),
  facilityName: z.string().min(1, 'Facility name is required'),
  verifierSignature: z.string().optional(),
  expiryDate: TimestampSchema,
  isRevoked: z.boolean(),
  revokedAt: TimestampSchema.optional(),
  revokedBy: z.string().optional(),
});

// ─── Booster ─────────────────────────────────────────────────────────

export const BoosterSchema = z.object({
  boosterId: z.string().min(1, 'Booster ID is required'),
  originalVaccinationId: z.string().min(1, 'Original vaccination ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  diseaseTargeted: z.string().min(1, 'Target disease is required'),
  category: VaccinationCategorySchema,
  doseNumber: z.number().int().positive(),
  totalDoses: z.number().int().positive(),
  dueDate: TimestampSchema,
  administeredAt: TimestampSchema.optional(),
  administeredBy: z.string().optional(),
  status: VaccinationStatusSchema,
  notes: z.string().optional(),
});

// ─── Timeline ────────────────────────────────────────────────────────

export const TimelineSchema = z.object({
  entryId: z.string().min(1, 'Entry ID is required'),
  vaccinationId: z.string().min(1, 'Vaccination ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  eventName: z.string().min(1, 'Event name is required'),
  eventType: z.enum([
    'scheduled',
    'administered',
    'verified',
    'booster_due',
    'certificate_generated',
    'adverse_event',
    'archived',
    'restored',
  ]),
  description: z.string().min(1, 'Description is required'),
  timestamp: TimestampSchema,
  performedBy: z.string().min(1, 'Performer ID is required'),
  facilityName: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── VaccinationRecord ──────────────────────────────────────────────

export const VaccinationRecordSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  vaccinationId: z.string().min(1, 'Vaccination ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  diseaseTargeted: z.string().min(1, 'Target disease is required'),
  category: VaccinationCategorySchema,
  status: VaccinationStatusSchema,
  doseNumber: z.number().int().positive('Dose number must be greater than 0'),
  totalDoses: z.number().int().positive('Total doses must be greater than 0'),
  administeredAt: TimestampSchema,
  administeredBy: z.string().min(1, 'Administrator ID is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  facilityName: z.string().min(1, 'Facility name is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  lotNumber: z.string().min(1, 'Lot number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  expiryDate: TimestampSchema,
  nextDueDate: TimestampSchema,
  administrationRoute: AdministrationRouteSchema,
  administrationSite: AdministrationSiteSchema,
  adverseEvent: AdverseEventSchema.optional(),
  certificateId: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.object({
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema,
    createdBy: z.string().min(1, 'Creator UID is required'),
    updatedBy: z.string().min(1, 'Updater UID is required'),
    version: z.number().int().min(1),
    status: z.string(),
    source: z.string(),
    ownerId: z.string().min(1, 'Owner ID is required'),
    origin: z.object({
      deviceId: z.string(),
      deviceType: z.string(),
      platform: z.string(),
      browser: z.string(),
      appVersion: z.string(),
    }),
    verification: z.object({
      isVerified: z.boolean(),
      verifiedBy: z.string().optional(),
      signature: z.string().optional(),
    }),
    interoperability: z.object({
      resourceType: z.string(),
      fhirVersion: z.string(),
      hashAlgorithm: z.string(),
      checksumVersion: z.string(),
    }),
    checksum: z.string(),
  }),
});
