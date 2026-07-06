import { executeAiPipeline } from '../utils/gemini';
import { hospitalHealthPrompt } from '../prompts/hospitalHealth';
import { healthScoreResultSchema } from '../types/validation';

export interface HealthScoreInput {
  bedOccupancyPercent: number;
  medicineStockoutPercent: number;
  staffAttendancePercent: number;
  activeAlertsCount: number;
  appointmentsCount: number;
}

export interface HealthScoreResult {
  healthScore: number;
  factors: Array<{
    metricName: string;
    impactScore: number;
    notes: string;
  }>;
  operationalStatus: 'critical' | 'warning' | 'stable' | 'excellent';
  recommendations: string[];
  mode?: 'live' | 'demo' | 'fallback';
}

export class HealthScoreService {
  static async calculateScore(input: HealthScoreInput): Promise<HealthScoreResult> {
    const pipelineResult = await executeAiPipeline({
      systemPrompt: hospitalHealthPrompt,
      input,
      schema: healthScoreResultSchema,
      mockFallback: (inp) => {
        let baseScore = 100;
        const factors: HealthScoreResult['factors'] = [];

        // Occupancy factor
        if (inp.bedOccupancyPercent > 90) {
          baseScore -= 15;
          factors.push({ metricName: 'Bed Occupancy', impactScore: -15, notes: 'Bed occupancy is critically high, exceeding 90% capacity limits.' });
        } else {
          factors.push({ metricName: 'Bed Occupancy', impactScore: 5, notes: 'Comfortable bed buffer reserves.' });
        }

        // Stockouts factor
        if (inp.medicineStockoutPercent > 10) {
          baseScore -= 20;
          factors.push({ metricName: 'Medicine Stockouts', impactScore: -20, notes: 'Formula shortages exceeding 10% threshold boundaries.' });
        } else {
          factors.push({ metricName: 'Medicine Stockouts', impactScore: 10, notes: 'Excellent pharmacy stock coverage levels.' });
        }

        // Attendance
        if (inp.staffAttendancePercent < 85) {
          baseScore -= 10;
          factors.push({ metricName: 'Staff Attendance', impactScore: -10, notes: 'Doctor/Nurse presence logged below 85%.' });
        }

        // Active Alerts
        if (inp.activeAlertsCount > 3) {
          baseScore -= 15;
          factors.push({ metricName: 'Critical Alerts', impactScore: -15, notes: 'Multiple active capacity and supply issues active.' });
        }

        baseScore = Math.max(Math.min(baseScore, 100), 0);
        let status: HealthScoreResult['operationalStatus'] = 'stable';
        if (baseScore < 60) status = 'critical';
        else if (baseScore < 80) status = 'warning';
        else if (baseScore > 90) status = 'excellent';

        return {
          healthScore: baseScore,
          factors,
          operationalStatus: status,
          recommendations: [
            'Coordinate medicine inventory transfers to clear stock deficits.',
            'Optimize doctor shifts to cover critical emergency hours.',
          ],
        };
      },
      endpointName: 'health-score',
    });

    return {
      ...pipelineResult.data,
      mode: pipelineResult.mode,
    };
  }
}
export default HealthScoreService;
