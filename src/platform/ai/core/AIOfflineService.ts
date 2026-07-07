export class AIOfflineService {
  async queueUpdateAIProvider(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateModelMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdatePromptTemplates(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAgentMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAutomationWorkflow(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateDecisionTree(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateRecommendations(data: Record<string, unknown>): Promise<void> {}
  async queueUpdatePredictionMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateCDSMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateGovernanceMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAISafetyMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateComplianceMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAICostMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAIUsageMetadata(data: Record<string, unknown>): Promise<void> {}

  async synchronize(): Promise<void> {}

  getPendingOperations(): number {
    return 0;
  }
}
