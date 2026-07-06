import { LabReportRecord, LabObservation } from '@/features/health-vault/types';

export type { LabReportRecord, LabObservation };

export interface LabTestRequest {
  requestId: string;
  patientId: string;
  patientName: string;
  testName: string;
  orderedBy: string; // Doctor Name
  hospitalId: string;
  hospitalName: string;
  status: 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  orderedAt: string | Date | { toDate: () => Date };
  prescriptionId?: string;
  specimenType?: string;
  specimenCollectedAt?: string | Date | { toDate: () => Date };
}

export type AbnormalFlag = 'N' | 'L' | 'H' | 'A';
