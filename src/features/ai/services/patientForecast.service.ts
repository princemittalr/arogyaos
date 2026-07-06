import { executeAiPipeline } from '../utils/gemini';
import { patientForecastPrompt } from '../prompts/patientForecast';
import { patientForecastResultArraySchema } from '../types/validation';

export interface PatientForecastInput {
  pastOPD: number[];
  pastIPD: number[];
  currentWaitingTime: number;
}

export interface PatientForecastResult {
  timeframe: 'tomorrow' | 'next_week';
  expectedOPD: number;
  expectedIPD: number;
  predictedWaitingTimeMinutes: number;
  confidence: number;
  reasoning: string;
}

export class PatientForecastService {
  static async getForecast(input: PatientForecastInput): Promise<{ forecasts: PatientForecastResult[]; mode: 'live' | 'demo' | 'fallback' }> {
    const pipelineResult = await executeAiPipeline({
      systemPrompt: patientForecastPrompt,
      input,
      schema: patientForecastResultArraySchema,
      mockFallback: (inp): PatientForecastResult[] => {
        const avgOPD = inp.pastOPD.length ? Math.round(inp.pastOPD.reduce((a, b) => a + b, 0) / inp.pastOPD.length) : 120;
        const avgIPD = inp.pastIPD.length ? Math.round(inp.pastIPD.reduce((a, b) => a + b, 0) / inp.pastIPD.length) : 15;

        return [
          {
            timeframe: 'tomorrow',
            expectedOPD: Math.round(avgOPD * 1.05),
            expectedIPD: Math.round(avgIPD * 0.95),
            predictedWaitingTimeMinutes: Math.max(inp.currentWaitingTime - 5, 10),
            confidence: 88,
            reasoning: 'Minor OPD volume rise forecasted due to local early-morning temperature drops leading to upper respiratory patient inflows.',
          },
          {
            timeframe: 'next_week',
            expectedOPD: Math.round(avgOPD * 7.2),
            expectedIPD: Math.round(avgIPD * 6.8),
            predictedWaitingTimeMinutes: Math.max(inp.currentWaitingTime + 10, 25),
            confidence: 82,
            reasoning: 'Overall stable operational capacity forecast matching weekly average appointment loads.',
          },
        ];
      },
      endpointName: 'patient-forecast',
    });

    return {
      forecasts: pipelineResult.data,
      mode: pipelineResult.mode,
    };
  }
}
export default PatientForecastService;
