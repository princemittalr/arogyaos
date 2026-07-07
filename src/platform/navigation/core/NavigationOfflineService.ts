export class NavigationOfflineService {
  async queueUpdateRouteMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateWorkspaceMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateSidebarMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateThemeMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateLanguageMetadata(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateQuickActions(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateCommandPalette(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async queueUpdateBreadcrumbs(data: Record<string, unknown>): Promise<void> {
    // Queue offline
  }

  async synchronize(): Promise<void> {
    // Flush queued navigation configuration updates
  }

  getPendingOperations(): number {
    return 0;
  }
}
