import { StorageRepository } from '../repositories/StorageRepository';
import { UnsupportedTypeError, DownloadDeniedError } from '../core/storageErrors';

const SUPPORTED_PREVIEW_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
];

export class PreviewService {
  private readonly storageRepo = new StorageRepository();

  /**
   * Checks if a MIME type supports inline previews.
   */
  public isSupportedPreview(contentType: string): boolean {
    return SUPPORTED_PREVIEW_TYPES.includes(contentType);
  }

  /**
   * Generates a secure preview URL for rendering in iframe or image tags.
   */
  public async getSecurePreviewUrl(
    fileId: string,
    userId: string,
    userRole: string
  ): Promise<string> {
    const metadata = await this.storageRepo.getFileMetadata(fileId);
    if (!metadata) {
      throw new DownloadDeniedError('The requested file metadata was not found.');
    }

    if (metadata.status === 'ARCHIVED') {
      throw new DownloadDeniedError('This file has been archived and cannot be previewed.');
    }

    if (!this.isSupportedPreview(metadata.contentType)) {
      throw new UnsupportedTypeError(metadata.contentType);
    }

    // Permission enforcement (enforced server-side in actual API route)
    const isOwner = metadata.ownerId === userId;
    const isClinical = ['doctor', 'nurse', 'hospital_admin'].includes(userRole);
    const isSuperAdmin = userRole === 'super_admin';

    if (!isOwner && !isClinical && !isSuperAdmin) {
      throw new DownloadDeniedError('Permission Denied: You do not have privilege to preview this document.');
    }

    // Return the secure, controlled preview handler proxy endpoint path
    return `/api/health-vault/preview?fileId=${fileId}`;
  }
}
export default PreviewService;
