export type RecommendationType = 'Diagnosis' | 'Medication' | 'Investigation' | 'CarePlan' | 'Preventive';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High' | 'VeryHigh';
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'ExpertOpinion';
export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe' | 'LifeThreatening';
export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Critical';
export type DecisionStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Modified' | 'NeedsReview';
export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected' | 'Escalated';

export interface GuidelineReference {
  id: string;
  source: string;
  title: string;
  url?: string;
  evidenceLevel: EvidenceLevel;
}

export interface ClinicalEvidence {
  summary: string;
  references: GuidelineReference[];
  confidence: ConfidenceLevel;
}

export interface ClinicalExplanation {
  reasoning: string;
  evidence: ClinicalEvidence;
}

export interface ClinicalConfidence {
  score: number; // 0 to 1
  level: ConfidenceLevel;
  factors: string[];
}

export interface ClinicalRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  explanation: ClinicalExplanation;
  confidence: ClinicalConfidence;
  severity?: SeverityLevel;
}

export interface ClinicalRule {
  id: string;
  category: string;
  condition: string;
  action: string;
  priority: number;
}

export interface ClinicalGuideline {
  id: string;
  title: string;
  version: string;
  rules: ClinicalRule[];
}

export interface DiagnosisCandidate {
  icd10Code: string;
  name: string;
  probability: number;
  supportingSymptoms: string[];
  refutingSymptoms: string[];
}

export interface DifferentialDiagnosis {
  id: string;
  candidates: DiagnosisCandidate[];
  recommendation: ClinicalRecommendation;
}

export interface SymptomAnalysis {
  id: string;
  extractedSymptoms: string[];
  severity: SeverityLevel;
  redFlags: string[];
}

export interface MedicationRecommendation {
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  rationale: string;
}

export interface DrugInteractionAnalysis {
  medicationIds: string[];
  severity: SeverityLevel;
  description: string;
  managementRecommendation: string;
}

export interface AllergyAnalysis {
  allergenId: string;
  severity: SeverityLevel;
  reaction: string;
  recommendation: string;
}

export interface ContraindicationAnalysis {
  conditionId: string;
  medicationId: string;
  severity: SeverityLevel;
  reason: string;
}

export interface MedicationSafetyCheck {
  id: string;
  interactions: DrugInteractionAnalysis[];
  allergies: AllergyAnalysis[];
  contraindications: ContraindicationAnalysis[];
  isSafe: boolean;
  overallSeverity?: SeverityLevel;
}

export interface DiagnosticSuggestion {
  id: string;
  testName: string;
  loincCode?: string;
  rationale: string;
  priority: SeverityLevel;
}

export interface InvestigationRecommendation {
  id: string;
  suggestions: DiagnosticSuggestion[];
  recommendation: ClinicalRecommendation;
}

export interface CarePlanRecommendation {
  id: string;
  goals: string[];
  interventions: string[];
  recommendation: ClinicalRecommendation;
}

export interface PreventiveCareRecommendation {
  id: string;
  activity: string;
  frequency: string;
  rationale: string;
}

export interface RiskAssessment {
  id: string;
  category: RiskCategory;
  score: number;
  factors: string[];
  assessedAt: string;
}

export interface ClinicalAlert {
  id: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  generatedAt: string;
  requiresAction: boolean;
}

export interface ClinicalWarning {
  id: string;
  message: string;
  level: SeverityLevel;
}

export interface KnowledgeBaseVersion {
  id: string;
  version: string;
  releasedAt: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  topic: string;
  content: string;
  version: string;
}

export interface PromptContext {
  patientId: string;
  clinicalHistory: string;
  currentSymptoms: string;
  currentMedications: string[];
  activeDiagnoses: string[];
}

export interface AIProvider {
  id: string;
  name: string;
  type: string;
}

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  version: string;
  capabilities: string[];
}

export interface InferenceRequest {
  id: string;
  modelId: string;
  context: PromptContext;
  requestedAt: string;
}

export interface InferenceResponse {
  id: string;
  requestId: string;
  rawOutput: string;
  parsedRecommendations: ClinicalRecommendation[];
  generatedAt: string;
}

export interface ClinicalDecision {
  id: string;
  patientId: string;
  doctorId: string;
  status: DecisionStatus;
  recommendations: ClinicalRecommendation[];
  alerts: ClinicalAlert[];
  createdAt: string;
  updatedAt: string;
}

export interface HumanReview {
  id: string;
  decisionId: string;
  reviewerId: string;
  status: ReviewStatus;
  comments: string;
  reviewedAt: string;
}

export interface DecisionAudit {
  id: string;
  decisionId: string;
  action: string;
  actorId: string;
  timestamp: string;
  details: Record<string, unknown>;
}
