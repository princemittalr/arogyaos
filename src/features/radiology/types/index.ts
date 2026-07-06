import { BaseVaultRecord, VaultMetadata } from '@/features/health-vault/types';

export interface DicomMetadataSummary {
  patientBirthDate?: string;
  patientSex?: 'M' | 'F' | 'O';
  manufacturer?: string;
  institutionName?: string;
  studyDate?: string;
  studyTime?: string;
  studyDescription?: string;
  accessionNumber?: string;
}

export interface ImagingInstance {
  sopInstanceUid: string;
  number: number;
  sopClassUid: string;
  rows?: number;
  columns?: number;
  thumbnailUrl?: string;
  storageRefUrl?: string;
}

export interface ImagingSeries {
  seriesInstanceUid: string;
  number: number;
  modality: string;
  description?: string;
  numberOfInstances: number;
  instances: ImagingInstance[];
}

export interface KeyImageSlice {
  sopInstanceUid: string;
  seriesInstanceUid: string;
  instanceNumber: number;
  thumbnailUrl: string;
  description?: string;
}

export interface RadiologyStudy extends BaseVaultRecord {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  prescriptionId?: string;
  encounterId?: string;
  hospitalId: string;
  hospitalName: string;
  modality: 'CT' | 'MR' | 'XR' | 'US' | 'PET' | 'MG' | 'NM' | 'OT';
  bodySite: string;
  referredBy: string;
  numberOfSeries: number;
  numberOfInstances: number;
  status: 'registered' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: string | Date;
  completedAt?: string | Date;
  dicomMetadata?: DicomMetadataSummary;
  series: ImagingSeries[];
  reportId?: string;
  report?: RadiologyReport | null;
}

export interface RadiologyReport {
  reportId: string;
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  radiologistId: string;
  radiologistName: string;
  findings: string;
  impression: string;
  isCritical: boolean;
  status: 'preliminary' | 'final' | 'amended' | 'cancelled';
  signedAt: string;
  keyImages: KeyImageSlice[];
  metadata?: VaultMetadata;
}
