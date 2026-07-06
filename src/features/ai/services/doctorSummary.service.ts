import { executeAiPipeline } from '../utils/gemini';
import { doctorSummaryPrompt } from '../prompts/doctorSummary';
import { doctorSummaryResultSchema } from '../types/validation';

export interface DoctorSummaryInput {
  clinicalNotes: string;
  voiceTranscriptPlaceholder?: string;
}

export interface DoctorSummaryResult {
  summary: string;
  diagnosis: string;
  symptomsList: string[];
  prescriptionDraft: Array<{
    medicineName: string;
    dosage: string;
    duration: string;
  }>;
  followUpAdvice: string;
  mode?: 'live' | 'demo' | 'fallback';
}

export class DoctorSummaryService {
  static async getSummary(input: DoctorSummaryInput): Promise<DoctorSummaryResult> {
    const pipelineResult = await executeAiPipeline({
      systemPrompt: doctorSummaryPrompt,
      input,
      schema: doctorSummaryResultSchema,
      mockFallback: () => ({
        summary: 'Patient presents with symptoms of upper respiratory tract infection. Congested throat, minor wheezing, lungs clear.',
        diagnosis: 'Acute Rhinopharyngitis (Common Cold)',
        symptomsList: ['Throat congestion', 'Runny nose', 'Mild fatigue'],
        prescriptionDraft: [
          { medicineName: 'Paracetamol 650mg', dosage: '1 tablet twice a day', duration: '3 days' },
          { medicineName: 'Amoxicillin 500mg', dosage: '1 capsule thrice a day', duration: '5 days' },
        ],
        followUpAdvice: 'Maintain hydration and steam inhale twice daily. Follow up if fever exceeds 101F.',
      }),
      endpointName: 'doctor-summary',
    });

    return {
      ...pipelineResult.data,
      mode: pipelineResult.mode,
    };
  }
}
export default DoctorSummaryService;
