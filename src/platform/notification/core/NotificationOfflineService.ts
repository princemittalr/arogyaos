export class NotificationOfflineService {
  async queueCreateNotificationMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateTemplateMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdatePreferences(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateCampaignMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queuePublishAnnouncementMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateInboxMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateSubscriptions(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateTopics(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateCommunicationPolicies(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateCommunicationRules(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async synchronize(): Promise<void> {
    // Flush queued metadata updates
  }

  getPendingOperations(): number {
    return 0;
  }
}
