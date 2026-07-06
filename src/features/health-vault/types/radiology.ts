import { BaseVaultRecord } from './index';

export interface RadiologyReportRecord extends BaseVaultRecord {
  studyType: string; // e.g. "MRI Brain", "Chest X-Ray", "CT Abdomen"
  modality: string;  // e.g. "MR", "DX", "CT"
  bodySite: string;
  findingNotes: string;
  impression: string;
  radiologistId: string;
  radiologistName: string;
  attachmentUrl?: string; // DICOM image URL or PDF report link
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
}
