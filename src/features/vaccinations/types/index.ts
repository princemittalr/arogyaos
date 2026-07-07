import { BaseVaultRecord, VaultMetadata } from '@/features/health-vault/types';

export type VaccinationStatus =
  | 'scheduled'
  | 'due'
  | 'administered'
  | 'verified'
  | 'delayed'
  | 'missed'
  | 'cancelled'
  | 'refused'
  | 'expired';

export type VaccineCategory =
  | 'childhood'
  | 'adult'
  | 'pregnancy'
  | 'occupational'
  | 'travel'
  | 'booster'
  | 'covid'
  | 'influenza'
  | 'hepatitis'
  | 'hpv';

export interface AdverseEvent {
  reportedAt: string | Date;
  symptoms: string;
  severity: 'mild' | 'moderate' | 'severe';
  actionTaken?: string;
  reporterName: string;
}

export interface Vaccination extends BaseVaultRecord {
  vaccinationId: string; // matches recordId
  patientId: string; // matches ownerId
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccineCategory;
  status: VaccinationStatus;
  doseNumber: number;
  totalDoses: number;
  administeredAt?: string | Date;
  administeredBy?: string;
  facilityName?: string;
  batchNumber?: string;
  lotNumber?: string;
  manufacturer?: string;
  expiryDate?: string | Date;
  nextDueDate?: string | Date;
  adverseEvent?: AdverseEvent;
  certificateId?: string;
  notes?: string;
}

export interface VaccinationSchedule {
  scheduleId: string;
  patientId: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccineCategory;
  status: 'scheduled' | 'due' | 'administered' | 'delayed' | 'missed';
  dueDate: string | Date;
  doseNumber: number;
  totalDoses: number;
  notes?: string;
  metadata?: VaultMetadata;
}

export interface VaccinationCertificate extends BaseVaultRecord {
  certificateId: string; // matches recordId
  vaccinationId: string;
  certificateNumber: string;
  qrCodeData: string;
  generatedAt: string | Date;
  pdfUrl?: string;
  patientId: string;
  patientName: string;
  vaccineName: string;
  administeredAt: string | Date;
  facilityName: string;
  verifierSignature?: string;
}
