import { storage, db } from '@/firebase/client';
import { ref, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { runTransaction, serverTimestamp } from 'firebase/firestore';
import { StorageRepository } from '../repositories/StorageRepository';
import { VaultFileMetadata } from '../types/storage';
import { UploadService } from './UploadService';
import {
  UploadFailedError,
  DownloadDeniedError,
  InvalidFileError,
  UnsupportedTypeError,
} from '../core/storageErrors';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export interface VersionUploadController {
  task: UploadTask;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  fileId: string;
  nextVersion: number;
}

export class VersionService {
  private readonly storageRepo = new StorageRepository();
  private readonly uploadService = new UploadService();

  /**
   * Processes a file replacement, creating a new storage version and tracking history.
   */
  public async uploadNewVersion(
    fileId: string,
    file: File,
    context: {
      uploadedBy: string;
    },
    callbacks: {
      onProgress?: (progress: number) => void;
      onComplete?: (metadata: VaultFileMetadata) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<VersionUploadController> {
    // 1. Fetch current metadata
    const currentMetadata = await this.storageRepo.getFileMetadata(fileId);
    if (!currentMetadata) {
      throw new DownloadDeniedError('Target file for version update not found.');
    }

    if (currentMetadata.status === 'ARCHIVED') {
      throw new DownloadDeniedError('Cannot update version on an archived file.');
    }

    // 2. Standard validations
    if (!file) {
      throw new InvalidFileError('No file was provided for version update.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new UnsupportedTypeError(file.type);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new InvalidFileError(`File size exceeds 50 MB limit.`);
    }

    const nextVersion = currentMetadata.version + 1;
    
    // Decoupled path with version suffix to guarantee that originals are never overwritten
    const baseStoragePath = this.uploadService.generateStoragePath(currentMetadata.ownerId, fileId);
    const versionedStoragePath = `${baseStoragePath}_v${nextVersion}`;
    const nextChecksum = await this.uploadService.calculateFileHash(file);

    const fileRef = ref(storage, versionedStoragePath);

    const storageMetadata = {
      customMetadata: {
        fileId,
        version: nextVersion.toString(),
        ownerId: currentMetadata.ownerId,
        clientChecksum: nextChecksum,
      },
    };

    const task = uploadBytesResumable(fileRef, file, storageMetadata);

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (callbacks.onProgress) {
          callbacks.onProgress(progress);
        }
      },
      (error) => {
        console.error('[VersionService] File version upload task aborted.', { fileId, nextVersion, error: error.message });
        if (callbacks.onError) {
          callbacks.onError(new UploadFailedError(`File version upload failed: ${error.message}`, error));
        }
      },
      async () => {
        // Prepare updated metadata payload
        const updatedMetadata: VaultFileMetadata = {
          ...currentMetadata,
          contentType: file.type,
          originalFileName: file.name,
          fileSize: file.size,
          checksum: nextChecksum,
          uploadedAt: serverTimestamp(),
          uploadedBy: context.uploadedBy,
          storagePath: versionedStoragePath,
          version: nextVersion,
        };

        try {
          await runTransaction(db, async (transaction) => {
            // Write old snapshot to versions sub-collection first
            await this.storageRepo.saveFileMetadataVersion(fileId, currentMetadata.version, currentMetadata, transaction);
            // Overwrite main document with new active version state
            await this.storageRepo.saveFileMetadata(updatedMetadata, transaction);
          });

          if (callbacks.onComplete) {
            callbacks.onComplete(updatedMetadata);
          }
        } catch (dbErr: unknown) {
          if (callbacks.onError) {
            const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
            callbacks.onError(new UploadFailedError(`Metadata version persistence failed: ${msg}`, dbErr));
          }
        }
      }
    );

    return {
      task,
      cancel: () => task.cancel(),
      pause: () => task.pause(),
      resume: () => task.resume(),
      fileId,
      nextVersion,
    };
  }
}
export default VersionService;
