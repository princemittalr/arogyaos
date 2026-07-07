export type PredictionType = 'BinaryClassification' | 'MulticlassClassification' | 'Regression' | 'TimeSeries' | 'SurvivalAnalysis' | 'Clustering' | 'AnomalyDetection';
export type ForecastType = 'ShortTerm' | 'MediumTerm' | 'LongTerm' | 'Strategic';
export type ModelCategory = 'Resource' | 'Clinical' | 'Population' | 'Financial' | 'Operational';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High' | 'VeryHigh';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type BiasLevel = 'Negligible' | 'Low' | 'Moderate' | 'High' | 'Critical';
export type DriftLevel = 'None' | 'Warning' | 'Critical';
export type PredictionStatus = 'Pending' | 'Completed' | 'Failed' | 'Rejected' | 'Approved';
export type ForecastStatus = 'Pending' | 'Generated' | 'Validated' | 'Failed' | 'Rejected';

export interface PredictionFeature {
  name: string;
  type: string;
  value: unknown;
}

export interface FeatureImportance {
  featureName: string;
  importanceScore: number;
  direction: 'Positive' | 'Negative' | 'Neutral';
}

export interface ConfidenceInterval {
  lowerBound: number;
  upperBound: number;
  confidenceLevel: number;
}

export interface PredictionConfidence {
  score: number;
  level: ConfidenceLevel;
  interval?: ConfidenceInterval;
}

export interface PredictionExplanation {
  rationale: string;
  topFeatures: FeatureImportance[];
}

export interface PredictionMetadata {
  modelId: string;
  modelVersion: string;
  executionTimeMs: number;
  generatedAt: string;
}

export interface PredictionRequest {
  id: string;
  modelId: string;
  targetId: string;
  features: PredictionFeature[];
  requestedAt: string;
}

export interface PredictionResult {
  id: string;
  requestId: string;
  prediction: unknown;
  confidence: PredictionConfidence;
  explanation: PredictionExplanation;
  metadata: PredictionMetadata;
  status: PredictionStatus;
}

export interface PredictionScenario {
  id: string;
  name: string;
  description: string;
  adjustedFeatures: PredictionFeature[];
  basePredictionId: string;
  scenarioPredictionId: string;
}

export interface PredictionBatch {
  id: string;
  modelId: string;
  targetIds: string[];
  status: PredictionStatus;
  startedAt: string;
  completedAt?: string;
  results: PredictionResult[];
}

export interface PredictionHistory {
  targetId: string;
  modelId: string;
  predictions: PredictionResult[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface TrendAnalysis {
  direction: 'Increasing' | 'Decreasing' | 'Stable';
  magnitude: number;
  significance: number;
}

export interface SeasonalityAnalysis {
  pattern: 'Daily' | 'Weekly' | 'Monthly' | 'Annual' | 'None';
  strength: number;
}

export interface AnomalyDetection {
  timestamp: string;
  expectedValue: number;
  actualValue: number;
  severity: RiskLevel;
}

export interface ForecastRequest {
  id: string;
  targetMetric: string;
  horizonDays: number;
  frequency: string;
  requestedAt: string;
}

export interface ForecastResult {
  id: string;
  requestId: string;
  points: TimeSeriesPoint[];
  trend: TrendAnalysis;
  seasonality: SeasonalityAnalysis;
  anomalies: AnomalyDetection[];
  metadata: PredictionMetadata;
  status: ForecastStatus;
}

export interface ResourceForecast {
  id: string;
  resourceId: string;
  forecast: ForecastResult;
}

export interface CapacityForecast {
  id: string;
  facilityId: string;
  capacityMetric: string;
  forecast: ForecastResult;
}

export interface DemandForecast {
  id: string;
  serviceId: string;
  demandMetric: string;
  forecast: ForecastResult;
}

export interface BedOccupancyPrediction extends CapacityForecast {
  wardId: string;
}

export interface ICUDemandPrediction extends DemandForecast {
  icuId: string;
}

export interface EmergencyDemandPrediction extends DemandForecast {
  emergencyDepartmentId: string;
}

export interface AppointmentDemandPrediction extends DemandForecast {
  departmentId: string;
}

export interface LaboratoryDemandPrediction extends DemandForecast {
  laboratoryId: string;
}

export interface PharmacyDemandPrediction extends DemandForecast {
  pharmacyId: string;
}

export interface InventoryForecast {
  id: string;
  itemId: string;
  forecast: ForecastResult;
}

export interface WorkforceForecast {
  id: string;
  roleId: string;
  forecast: ForecastResult;
}

export interface DiseaseSpreadPrediction {
  id: string;
  diseaseId: string;
  locationId: string;
  forecast: ForecastResult;
}

export interface PopulationRiskPrediction {
  id: string;
  populationGroupId: string;
  riskCategory: string;
  prediction: PredictionResult;
}

export interface ReadmissionPrediction {
  id: string;
  patientId: string;
  prediction: PredictionResult;
}

export interface MortalityPrediction {
  id: string;
  patientId: string;
  prediction: PredictionResult;
}

export interface ClinicalDeteriorationPrediction {
  id: string;
  patientId: string;
  prediction: PredictionResult;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  evaluatedAt: string;
}

export interface ModelPerformance {
  modelId: string;
  version: string;
  metrics: ModelMetrics;
  validationDatasetId: string;
}

export interface ModelDrift {
  modelId: string;
  driftLevel: DriftLevel;
  driftScore: number;
  affectedFeatures: string[];
  detectedAt: string;
}

export interface FairnessMetrics {
  disparateImpact: number;
  equalOpportunityDifference: number;
  demographicParityDifference: number;
}

export interface BiasAssessment {
  modelId: string;
  protectedAttribute: string;
  biasLevel: BiasLevel;
  metrics: FairnessMetrics;
  assessedAt: string;
}

export interface PredictionModel {
  id: string;
  name: string;
  version: string;
  category: ModelCategory;
  predictionType: PredictionType;
  description: string;
  status: 'Active' | 'Deprecated' | 'Archived';
}

export interface PredictionAudit {
  id: string;
  predictionId: string;
  action: string;
  actorId: string;
  timestamp: string;
  details: Record<string, unknown>;
}
