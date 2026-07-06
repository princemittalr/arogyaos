import { BaseVaultRecord } from '@/features/health-vault/types';

export type PrescriptionStatus = 'Draft' | 'Active' | 'Completed' | 'Suspended' | 'Expired' | 'Cancelled';

export interface DosageInstructions {
  pattern: string; // e.g. "1-0-1", "0-0-1", "custom"
  quantityPerDose: number;
  unit: 'pill' | 'ml' | 'mg' | 'drop' | 'puff';
  timing: 'before-meal' | 'after-meal' | 'with-meal' | 'empty-stomach';
}

export interface MedicationSchedule {
  startDate: Date | { toDate: () => Date } | string; // Firestore Timestamp or string date
  endDate: Date | { toDate: () => Date } | string; // Firestore Timestamp or string date
  durationDays: number;
  recurrence: 'daily' | 'weekly' | 'alternate-days';
  timeTargets?: string[]; // e.g. ["08:00", "20:00"]
}

export interface MedicationItem {
  medicineId: string;
  name: string;
  brandName?: string;
  formulation: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'ointment';
  strength: string; // e.g. "500mg"
  dosage: DosageInstructions;
  schedule: MedicationSchedule;
  instructions?: string; // e.g. "Take with warm water"
}

export interface PrescriptionRecord extends BaseVaultRecord {
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  encounterId?: string;
  diagnosis: string;
  medicines: Array<MedicationItem>;
  refillsAllowed: number;
  refillsRemaining: number;
  validUntil: Date | { toDate: () => Date } | string; // Firestore Timestamp
  status: PrescriptionStatus;
  notes?: string;
  attachments?: Array<{
    fileId: string;
    originalFileName: string;
  }>;
}

export interface RefillTransaction {
  refillId: string;
  prescriptionId: string;
  requestedAt: Date | { toDate: () => Date } | string; // Firestore Timestamp
  requestedQuantity: number;
  status: 'requested' | 'authorized' | 'dispensed' | 'rejected';
  pharmacyId?: string;
  pharmacyName?: string;
  processedAt?: Date | { toDate: () => Date } | string; // Firestore Timestamp
  notes?: string;
  authorizedBy?: string; // Doctor UID
  dispensedBy?: string; // Pharmacist UID
}
