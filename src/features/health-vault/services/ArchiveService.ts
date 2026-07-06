import { db } from '@/firebase/client';
import { runTransaction } from 'firebase/firestore';
import { StorageRepository } from '../repositories/StorageRepository';
import { DownloadDeniedError } from '../core/storageErrors';
import { HealthVaultEventBus } from '../core/events';

export class ArchiveService {
  private readonly storageRepo = new StorageRepository();
  private readonly eventBus = HealthVaultEventBus.getInstance();

  /**
   * Archives a file, hiding it from default queries while preserving storage and versions.
   */
  public async archiveFile(fileId: string, operatorId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const metadata = await this.storageRepo.getFileMetadata(fileId, transaction);
        if (!metadata) {
          throw new DownloadDeniedError('File metadata not found.');
        }

        if (metadata.status === 'ARCHIVED') {
          return; // Already archived
        }

        // Keep historical copy
        const currentVersion = metadata.version;
        await this.storageRepo.saveFileMetadataVersion(fileId, currentVersion, metadata, transaction);

        // Update status and increment version
        await this.storageRepo.updateFileMetadata(
          fileId,
          {
            status: 'ARCHIVED',
            version: currentVersion + 1,
            uploadedBy: operatorId, // Operator updating the file
          },
          transaction
        );
      });

      // Trigger event
      await this.eventBus.publish('RecordArchived', {
        recordId: fileId, // fileId acts as the unique entity id for this storage entry
        archiverId: operatorId,
        timestamp: new Date(),
      });
    } catch (err: unknown) {
      console.error('[ArchiveService] File archive failed.', { fileId, error: err instanceof Error ? err.message : err });
      throw err;
    }
  }

  /**
   * Restores an archived file back to active status, recovering visibility.
   */
  public async restoreFile(fileId: string, operatorId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const metadata = await this.storageRepo.getFileMetadata(fileId, transaction);
        if (!metadata) {
          throw new DownloadDeniedError('File metadata not found.');
        }

        if (metadata.status === 'ACTIVE') {
          return; // Already active
        }

        // Keep historical copy
        const currentVersion = metadata.version;
        await this.storageRepo.saveFileMetadataVersion(fileId, currentVersion, metadata, transaction);

        // Update status and increment version
        await this.storageRepo.updateFileMetadata(
          fileId,
          {
            status: 'ACTIVE',
            version: currentVersion + 1,
            uploadedBy: operatorId,
          },
          transaction
        );
      });

      // Trigger event
      await this.eventBus.publish('RecordRestored', {
        recordId: fileId,
        restorerId: operatorId,
        timestamp: new Date(),
      });
    } catch (err: unknown) {
      console.error('[ArchiveService] File restore failed.', { fileId, error: err instanceof Error ? err.message : err });
      throw err;
    }
  }
}
export default ArchiveService;
