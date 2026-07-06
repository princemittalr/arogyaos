import { StorageRepository } from '../repositories/StorageRepository';
import { DownloadDeniedError } from '../core/storageErrors';
import { HealthVaultEventBus } from '../core/events';

export class DownloadService {
  private readonly storageRepo = new StorageRepository();
  private readonly eventBus = HealthVaultEventBus.getInstance();

  /**
   * Prepares and triggers a secure download stream for an authorized user.
   */
  public async downloadFile(fileId: string, userId: string, userRole: string): Promise<void> {
    // 1. Fetch file metadata
    const metadata = await this.storageRepo.getFileMetadata(fileId);
    if (!metadata) {
      throw new DownloadDeniedError('The requested file metadata was not found.');
    }

    if (metadata.status === 'ARCHIVED') {
      throw new DownloadDeniedError('This file has been archived and cannot be downloaded directly.');
    }

    // 2. Client-side preflight permission checks (fully enforced server-side in the API route)
    const isOwner = metadata.ownerId === userId;
    const isClinical = ['doctor', 'nurse', 'hospital_admin'].includes(userRole);
    const isSuperAdmin = userRole === 'super_admin';

    if (!isOwner && !isClinical && !isSuperAdmin) {
      throw new DownloadDeniedError('Permission Denied: You do not have privilege to download this document.');
    }

    // 3. Log audit event
    await this.eventBus.publish('RecordDownloaded', {
      recordId: metadata.recordId,
      fileId,
      downloaderId: userId,
      timestamp: new Date(),
    });

    // 4. Redirect to streaming API endpoint
    if (typeof window !== 'undefined') {
      window.location.href = `/api/health-vault/download?fileId=${fileId}`;
    }
  }
}
export default DownloadService;
