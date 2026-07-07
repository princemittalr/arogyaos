export class SearchOfflineService {
  async queueCreateSearchQueryMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateSearchConfiguration(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateProviderMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateSearchIndexes(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateKnowledgeEntities(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateRelationships(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateRankingPolicies(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateSavedSearches(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async synchronize(): Promise<void> {
    // Flush queued metadata updates
  }

  getPendingOperations(): number {
    return 0;
  }
}
