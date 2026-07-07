export const RECOMMENDATION_TYPES = [
  'Diagnosis',
  'Medication',
  'Investigation',
  'CarePlan',
  'Preventive'
] as const;

export const CONFIDENCE_LEVELS = [
  'Low',
  'Medium',
  'High',
  'VeryHigh'
] as const;

export const EVIDENCE_LEVELS = [
  'A',
  'B',
  'C',
  'D',
  'ExpertOpinion'
] as const;

export const SEVERITY_LEVELS = [
  'Mild',
  'Moderate',
  'Severe',
  'LifeThreatening'
] as const;

export const RISK_CATEGORIES = [
  'Low',
  'Moderate',
  'High',
  'Critical'
] as const;

export const DECISION_STATUSES = [
  'Pending',
  'Accepted',
  'Rejected',
  'Modified',
  'NeedsReview'
] as const;

export const REVIEW_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Escalated'
] as const;

export const SUPPORTED_AI_PROVIDERS = [
  'MetadataEngine',
  'AbstractInference'
] as const;

export const SUPPORTED_MODEL_TYPES = [
  'Diagnostic',
  'Pharmacological',
  'Triage'
] as const;

export const PROMPT_TYPES = [
  'DifferentialDiagnosis',
  'SafetyCheck',
  'TreatmentPlan'
] as const;

export const CLINICAL_RULE_CATEGORIES = [
  'Contraindication',
  'Dosage',
  'Protocol'
] as const;

export const SEARCH_FIELDS = [
  'decisionId',
  'patientId',
  'recommendationTitle'
] as const;

export const SUPPORTED_FILTERS = [
  'status',
  'type',
  'severity',
  'dateRange'
] as const;
