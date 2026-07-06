import { HealthVaultEventBus } from '@/features/health-vault/core/events';
import { TagRepository } from '../repositories/TagRepository';

export class DocumentEventListener {
  private static unsubscribe: (() => void) | null = null;
  private static readonly tagRepo = new TagRepository();

  /**
   * Initializes event subscriptions to listen to Health Vault events.
   */
  public static startListening(): void {
    if (this.unsubscribe) return;

    const eventBus = HealthVaultEventBus.getInstance();

    // Subscribe to RecordDeleted event to remove associated mappings
    const unsubDeleted = eventBus.subscribe('RecordDeleted', async (payload) => {
      try {
        const { recordId } = payload;
        await this.tagRepo.deleteMappingByRecordId(recordId);
      } catch (err) {
        console.error('[DocumentEventListener] Error handling RecordDeleted:', err);
      }
    });

    this.unsubscribe = () => {
      unsubDeleted();
    };
  }

  /**
   * Stop listening and unsubscribe.
   */
  public static stopListening(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export default DocumentEventListener;
