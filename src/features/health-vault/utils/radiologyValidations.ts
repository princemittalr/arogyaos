import { z } from 'zod';
import { BaseVaultRecordSchema } from './validations';

export const RadiologyReportRecordSchema = BaseVaultRecordSchema.extend({
  studyType: z.string().min(1, 'Study type is required'),
  modality: z.string().min(1, 'Modality is required'),
  bodySite: z.string().min(1, 'Body site is required'),
  findingNotes: z.string().min(1, 'Finding notes are required'),
  impression: z.string().min(1, 'Impression is required'),
  radiologistId: z.string().min(1, 'Radiologist ID is required'),
  radiologistName: z.string().min(1, 'Radiologist name is required'),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
  attachmentSize: z.number().int().positive().optional(),
  attachmentMimeType: z.string().optional(),
});
