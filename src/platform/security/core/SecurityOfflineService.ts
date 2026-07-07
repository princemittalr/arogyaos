export class SecurityOfflineService {
  async queueUpdateSecurityPolicy(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateAccessPolicy(data: Record<string, unknown>): Promise<void> {}
  async queueUpdatePermissionMatrix(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateRolePolicy(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateConsent(data: Record<string, unknown>): Promise<void> {}
  async queueUpdatePrivacyPolicy(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateClassification(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateEncryptionPolicy(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateComplianceFramework(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateComplianceControls(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateRisk(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateThreatModel(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateVulnerability(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateIncident(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateGovernancePolicy(data: Record<string, unknown>): Promise<void> {}

  async synchronize(): Promise<void> {}

  getPendingOperations(): number {
    return 0;
  }
}
