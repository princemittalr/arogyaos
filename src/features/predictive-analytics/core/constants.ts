export const PREDICTION_TYPES = [
  'BinaryClassification',
  'MulticlassClassification',
  'Regression',
  'TimeSeries',
  'SurvivalAnalysis',
  'Clustering',
  'AnomalyDetection'
] as const;

export const FORECAST_TYPES = [
  'ShortTerm',
  'MediumTerm',
  'LongTerm',
  'Strategic'
] as const;

export const MODEL_CATEGORIES = [
  'Resource',
  'Clinical',
  'Population',
  'Financial',
  'Operational'
] as const;

export const CONFIDENCE_LEVELS = [
  'Low',
  'Medium',
  'High',
  'VeryHigh'
] as const;

export const RISK_LEVELS = [
  'Low',
  'Moderate',
  'High',
  'Critical'
] as const;

export const BIAS_LEVELS = [
  'Negligible',
  'Low',
  'Moderate',
  'High',
  'Critical'
] as const;

export const DRIFT_LEVELS = [
  'None',
  'Warning',
  'Critical'
] as const;

export const PREDICTION_STATUSES = [
  'Pending',
  'Completed',
  'Failed',
  'Rejected',
  'Approved'
] as const;

export const FORECAST_STATUSES = [
  'Pending',
  'Generated',
  'Validated',
  'Failed',
  'Rejected'
] as const;

export const SUPPORTED_MODEL_FAMILIES = [
  'TreeBased',
  'Linear',
  'NeuralNetwork',
  'Ensemble',
  'Statistical'
] as const;

export const SUPPORTED_FEATURE_TYPES = [
  'Numeric',
  'Categorical',
  'Boolean',
  'DateTime',
  'TextEmbeddings'
] as const;

export const SEARCH_FIELDS = [
  'predictionId',
  'modelId',
  'targetId'
] as const;

export const SUPPORTED_FILTERS = [
  'status',
  'type',
  'category',
  'dateRange'
] as const;
