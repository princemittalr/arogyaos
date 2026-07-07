export class WorkflowOfflineService {
  async queueUpdateWorkflowDefinitions(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateWorkflowTemplates(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateWorkflowVersions(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateWorkflowTasks(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateApprovalTasks(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAssignmentRules(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateEscalationRules(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateSLAPolicies(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateBusinessRules(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateDecisionTables(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateWorkflowGovernance(data: Record<string, unknown>): Promise<void> {}

  async synchronize(): Promise<void> {}

  getPendingOperations(): number {
    return 0;
  }
}
