import { z } from 'zod';

// 1. ChatResult Zod Schema
export const chatResultSchema = z.object({
  responseText: z.string().min(1, 'Response text is required'),
  structuredInsights: z.array(
    z.object({
      title: z.string().min(1, 'Insight title is required'),
      metricValue: z.string().min(1, 'Metric value is required'),
      severity: z.enum(['critical', 'warning', 'info', 'success']),
    })
  ),
});

// 2. DistrictSummaryResult Zod Schema
export const districtSummaryResultSchema = z.object({
  operationalSummary: z.string().min(1, 'Operational summary is required'),
  criticalIssues: z.array(z.string()),
  recommendations: z.array(z.string()),
  facilityPriorityRanking: z.array(
    z.object({
      facilityName: z.string().min(1, 'Facility name is required'),
      priorityScore: z.number().min(0).max(100),
      attentionReason: z.string().min(1, 'Attention reason is required'),
    })
  ),
});

// 3. DoctorSummaryResult Zod Schema
export const doctorSummaryResultSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  symptomsList: z.array(z.string()),
  prescriptionDraft: z.array(
    z.object({
      medicineName: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      duration: z.string().min(1, 'Duration is required'),
    })
  ),
  followUpAdvice: z.string().min(1, 'Follow up advice is required'),
});

// 4. HealthScoreResult Zod Schema
export const healthScoreResultSchema = z.object({
  healthScore: z.number().min(0).max(100),
  factors: z.array(
    z.object({
      metricName: z.string().min(1, 'Metric name is required'),
      impactScore: z.number().min(-100).max(100),
      notes: z.string().min(1, 'Notes is required'),
    })
  ),
  operationalStatus: z.enum(['critical', 'warning', 'stable', 'excellent']),
  recommendations: z.array(z.string()),
});

// 5. PatientForecastResult Zod Schema
export const patientForecastResultSchema = z.object({
  timeframe: z.enum(['tomorrow', 'next_week']),
  expectedOPD: z.number().nonnegative(),
  expectedIPD: z.number().nonnegative(),
  predictedWaitingTimeMinutes: z.number().nonnegative(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string().min(1, 'Reasoning is required'),
});

export const patientForecastResultArraySchema = z.array(patientForecastResultSchema);

// 6. ResourceRedistributionResult Zod Schema
export const resourceRedistributionResultSchema = z.object({
  sourceHospitalName: z.string().min(1, 'Source hospital name is required'),
  targetHospitalName: z.string().min(1, 'Target hospital name is required'),
  itemType: z.enum(['medicine', 'equipment', 'staff']),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive(),
  expectedImpact: z.string().min(1, 'Expected impact is required'),
  priority: z.enum(['high', 'medium', 'low']),
  reason: z.string().min(1, 'Reason is required'),
});

export const resourceRedistributionResultArraySchema = z.array(resourceRedistributionResultSchema);

// 7. StockForecastResult Zod Schema
export const stockForecastResultSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  expectedShortageDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  confidence: z.number().min(0).max(100),
  riskLevel: z.enum(['high', 'medium', 'low']),
  recommendedRefillQuantity: z.number().nonnegative(),
  reasoning: z.string().min(1, 'Reasoning is required'),
  suggestedAction: z.string().min(1, 'Suggested action is required'),
});

export const stockForecastResultArraySchema = z.array(stockForecastResultSchema);
