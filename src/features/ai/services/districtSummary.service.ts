import { executeAiPipeline } from '../utils/gemini';
import { districtSummaryPrompt } from '../prompts/districtSummary';
import { districtSummaryResultSchema } from '../types/validation';

export interface DistrictSummaryInput {
  hospitalsCount: number;
  phcsCount: number;
  chcsCount: number;
  totalDoctors: number;
  activeAlerts: Array<{ hospitalName: string; message: string; severity: string }>;
}

export interface DistrictSummaryResult {
  operationalSummary: string;
  criticalIssues: string[];
  recommendations: string[];
  facilityPriorityRanking: Array<{
    facilityName: string;
    priorityScore: number;
    attentionReason: string;
  }>;
  mode?: 'live' | 'demo' | 'fallback';
}

export class DistrictSummaryService {
  static async getSummary(input: DistrictSummaryInput): Promise<DistrictSummaryResult> {
    const pipelineResult = await executeAiPipeline({
      systemPrompt: districtSummaryPrompt,
      input,
      schema: districtSummaryResultSchema,
      mockFallback: (inp) => ({
        operationalSummary: `District is operating stably overall across its ${inp.hospitalsCount} hospitals, ${inp.phcsCount} PHCs, and ${inp.chcsCount} CHCs. Attendance levels are standard, but capacity warnings require attention.`,
        criticalIssues: [
          'ICU capacity has reached 100% occupancy at West Block CHC.',
          'Metro PHC Center reports complete depletion of Oral Rehydration Salts (ORS).',
        ],
        recommendations: [
          'Redirect incoming critical ICU patients to City General Hospital.',
          'Execute urgent ORS redistribution transfer from Apex Specialty Hospital.',
        ],
        facilityPriorityRanking: [
          {
            facilityName: 'West Block CHC',
            priorityScore: 92,
            attentionReason: 'ICU occupancy overloaded and pediatrician shift absent.',
          },
          {
            facilityName: 'Metro PHC Center',
            priorityScore: 78,
            attentionReason: 'Depleted ORS stock reserves.',
          },
        ],
      }),
      endpointName: 'district-summary',
    });

    return {
      ...pipelineResult.data,
      mode: pipelineResult.mode,
    };
  }
}
export default DistrictSummaryService;
