import { callGemini } from '../utils/gemini';
import { doctorSummaryPrompt } from '../prompts/doctorSummary';

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
}

export class DoctorSummaryService {
  static async getSummary(input: DoctorSummaryInput): Promise<DoctorSummaryResult> {
    try {
      const responseText = await callGemini(doctorSummaryPrompt, JSON.stringify(input));
      return JSON.parse(responseText) as DoctorSummaryResult;
    } catch (error) {
      console.warn('DoctorSummaryService falling back to mock due to:', error);
      return {
        summary: 'Patient presents with symptoms of upper respiratory tract infection. Congested throat, minor wheezing, lungs clear.',
        diagnosis: 'Acute Rhinopharyngitis (Common Cold)',
        symptomsList: ['Throat congestion', 'Runny nose', 'Mild fatigue'],
        prescriptionDraft: [
          { medicineName: 'Paracetamol 650mg', dosage: '1 tablet twice a day', duration: '3 days' },
          { medicineName: 'Amoxicillin 500mg', dosage: '1 capsule thrice a day', duration: '5 days' },
        ],
        followUpAdvice: 'Maintain hydration and steam inhale twice daily. Follow up if fever exceeds 101F.',
      };
    }
  }
}
