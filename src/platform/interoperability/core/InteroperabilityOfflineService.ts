export class InteroperabilityOfflineService {
  async queueUpdateFHIRResources(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateFHIRProfiles(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateHL7Mappings(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateDICOMMetadata(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateTerminologyMappings(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateTransformationRules(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateSynchronizationProfiles(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateValidationProfiles(data: Record<string, unknown>): Promise<void> {}
  async queueUpdateExchangePolicies(data: Record<string, unknown>): Promise<void> {}
  async queueUpdatePartnerOrganizationMetadata(data: Record<string, unknown>): Promise<void> {}

  async synchronize(): Promise<void> {}

  getPendingOperations(): number {
    return 0;
  }
}
