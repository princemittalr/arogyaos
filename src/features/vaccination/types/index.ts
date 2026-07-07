import { BaseVaultRecord, VaultMetadata } from '@/features/health-vault/types';
import {
  VaccinationStatus,
  VaccinationCategory,
  AdministrationRoute,
  AdministrationSite,
  CertificateType,
  SeverityLevel,
} from '../core/constants';

export type { VaccinationStatus, VaccinationCategory };

export interface VaccinationRecord extends BaseVaultRecord {
  vaccinationId: string;
  patientId: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccinationCategory;
  status: VaccinationStatus;
  doseNumber: number;
  totalDoses: number;
  administeredAt: unknown;
  administeredBy: string;
  facilityId: string;
  facilityName: string;
  batchNumber: string;
  lotNumber: string;
  manufacturer: string;
  expiryDate: unknown;
  nextDueDate: unknown;
  administrationRoute: AdministrationRoute;
  administrationSite: AdministrationSite;
  adverseEvent?: AdverseEvent;
  certificateId?: string;
  notes?: string;
}

export interface Vaccine {
  vaccineId: string;
  name: string;
  code: string;
  diseaseTargeted: string;
  category: VaccinationCategory;
  manufacturer: string;
  totalDoses: number;
  doseIntervalDays: number[];
  administrationRoute: AdministrationRoute;
  administrationSite: AdministrationSite;
  storageRequirements?: string;
  contraindications?: string[];
  isActive: boolean;
}

export interface VaccineSchedule {
  scheduleId: string;
  patientId: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccinationCategory;
  status: VaccinationStatus;
  dueDate: unknown;
  scheduledDate: unknown;
  doseNumber: number;
  totalDoses: number;
  notes?: string;
  metadata: VaultMetadata;
}

export interface VaccineDose {
  doseId: string;
  vaccinationId: string;
  doseNumber: number;
  administeredAt: unknown;
  administeredBy: string;
  batchNumber: string;
  lotNumber: string;
  manufacturer: string;
  expiryDate: unknown;
  administrationRoute: AdministrationRoute;
  administrationSite: AdministrationSite;
  adverseEvent?: AdverseEvent;
}

export interface VaccineCertificate extends BaseVaultRecord {
  certificateId: string;
  vaccinationId: string;
  certificateNumber: string;
  certificateType: CertificateType;
  qrCodeData: string;
  generatedAt: unknown;
  generatedBy: string;
  pdfUrl?: string;
  patientId: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  doseNumber: number;
  totalDoses: number;
  administeredAt: unknown;
  administeredBy: string;
  facilityName: string;
  verifierSignature?: string;
  expiryDate: unknown;
  isRevoked: boolean;
  revokedAt?: unknown;
  revokedBy?: string;
}

export interface BoosterRecord extends BaseVaultRecord {
  boosterId: string;
  originalVaccinationId: string;
  patientId: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccinationCategory;
  doseNumber: number;
  totalDoses: number;
  dueDate: unknown;
  administeredAt?: unknown;
  administeredBy?: string;
  status: VaccinationStatus;
  notes?: string;
}

export interface VaccinationTimelineEntry {
  entryId: string;
  vaccinationId: string;
  patientId: string;
  eventName: string;
  eventType: 'scheduled' | 'administered' | 'verified' | 'booster_due' | 'certificate_generated' | 'adverse_event' | 'archived' | 'restored';
  description: string;
  timestamp: unknown;
  performedBy: string;
  facilityName?: string;
  metadata?: Record<string, unknown>;
}

export interface AdverseEvent {
  reportedAt: unknown;
  reportedBy: string;
  symptoms: string[];
  severity: SeverityLevel;
  actionTaken?: string;
  outcome?: string;
  reporterName: string;
  reporterContact?: string;
  facilityName?: string;
  isReportedToAuthority: boolean;
  authorityReportId?: string;
}
