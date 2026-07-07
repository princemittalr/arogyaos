export type AIProviderType = 'GOOGLE' | 'OPENAI' | 'ANTHROPIC' | 'OLLAMA' | 'CUSTOM';
export type AIModelCategory = 'LLM' | 'EMBEDDING' | 'IMAGE_GEN' | 'AUDIO_GEN' | 'CLASSIFICATION';
export type PromptType = 'SYSTEM' | 'USER' | 'FEW_SHOT' | 'CHAIN_OF_THOUGHT' | 'JSON_SCHEMA';
export type AgentType = 'CLINICAL' | 'ADMINISTRATIVE' | 'ANALYTICAL' | 'ROUTING' | 'RESEARCH';
export type AutomationType = 'WORKFLOW' | 'DATA_SYNC' | 'ALERTING' | 'MAINTENANCE';
export type DecisionType = 'ROUTING' | 'TRIAGE' | 'DOSAGE' | 'DIAGNOSIS' | 'POLICY';
export type PredictionType = 'RISK' | 'DEMAND' | 'OUTCOME' | 'COST';
export type ApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BYPASSED';
export type GovernanceLevel = 'STRICT' | 'MODERATE' | 'FLEXIBLE';
export type SafetyLevel = 'MAXIMUM' | 'HIGH' | 'BALANCED' | 'MINIMAL';
export type CostCategory = 'COMPUTE' | 'TOKEN' | 'STORAGE' | 'BANDWIDTH';

export interface AIProvider { id: string; name: string; type: AIProviderType; }
export interface AIModel { id: string; providerId: string; category: AIModelCategory; name: string; }
export interface AIModelVersion { id: string; modelId: string; version: string; isDefault: boolean; }
export interface AIEndpoint { id: string; providerId: string; url: string; }
export interface AIConfiguration { id: string; modelVersionId: string; maxTokens: number; temperature: number; }
export interface PromptTemplate { id: string; name: string; type: PromptType; content: string; }
export interface PromptVersion { id: string; templateId: string; version: string; }
export interface PromptParameter { id: string; templateId: string; key: string; isRequired: boolean; }
export interface PromptExecution { id: string; versionId: string; executedAt: string; }
export interface PromptLibrary { id: string; name: string; templates: string[]; }
export interface AIAgent { id: string; name: string; type: AgentType; configurationId: string; }
export interface AgentRole { id: string; agentId: string; roleName: string; }
export interface AgentCapability { id: string; agentId: string; capability: string; }
export interface AgentMemory { id: string; agentId: string; contextId: string; }
export interface AgentWorkflow { id: string; agentId: string; workflowName: string; }
export interface AgentTask { id: string; agentId: string; status: string; }
export interface AgentTool { id: string; agentId: string; definitionId: string; }
export interface ToolDefinition { id: string; name: string; description: string; }
export interface ToolExecution { id: string; toolId: string; executedAt: string; }
export interface FunctionDefinition { id: string; toolId: string; schema: string; }
export interface FunctionCall { id: string; functionId: string; parameters: string; }
export interface AutomationRule { id: string; name: string; type: AutomationType; }
export interface AutomationTrigger { id: string; ruleId: string; event: string; }
export interface AutomationAction { id: string; ruleId: string; actionType: string; }
export interface AutomationCondition { id: string; ruleId: string; expression: string; }
export interface AutomationWorkflow { id: string; ruleId: string; steps: string[]; }
export interface DecisionRule { id: string; name: string; type: DecisionType; }
export interface DecisionTree { id: string; ruleId: string; rootNodeId: string; }
export interface DecisionNode { id: string; treeId: string; logic: string; }
export interface Recommendation { id: string; decisionId: string; action: string; }
export interface Prediction { id: string; type: PredictionType; entityId: string; }
export interface PredictionModel { id: string; predictionId: string; modelVersionId: string; }
export interface PredictionResult { id: string; predictionId: string; score: number; }
export interface ClinicalDecisionSupport { id: string; ruleId: string; rationale: string; }
export interface ExplainabilityReport { id: string; predictionId: string; details: string; }
export interface AIObservation { id: string; entityId: string; metric: string; }
export interface AIEvaluation { id: string; modelVersionId: string; score: number; }
export interface AIExperiment { id: string; name: string; status: string; }
export interface AIApproval { id: string; entityId: string; state: ApprovalState; }
export interface HumanReview { id: string; approvalId: string; reviewerId: string; }
export interface ModelRegistry { id: string; name: string; models: string[]; }
export interface ModelDeployment { id: string; modelVersionId: string; endpointId: string; }
export interface ModelLifecycle { id: string; modelVersionId: string; stage: string; }
export interface FeatureStoreMetadata { id: string; name: string; }
export interface FeatureDefinition { id: string; storeId: string; schema: string; }
export interface FeatureVersion { id: string; definitionId: string; version: string; }
export interface AIGovernancePolicy { id: string; level: GovernanceLevel; rules: string[]; }
export interface AISafetyPolicy { id: string; level: SafetyLevel; constraints: string[]; }
export interface AICompliancePolicy { id: string; framework: string; isActive: boolean; }
export interface AIAuditRecord { id: string; entityId: string; action: string; timestamp: string; }
export interface AICostProfile { id: string; category: CostCategory; limit: number; }
export interface AITokenUsage { id: string; profileId: string; tokens: number; }
export interface AIUsageMetrics { id: string; modelId: string; totalTokens: number; }
export interface AIConfigurationProfile { id: string; name: string; settings: string[]; }
