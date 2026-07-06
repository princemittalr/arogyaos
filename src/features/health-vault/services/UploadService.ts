import { storage, db } from '@/firebase/client';
import { ref, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { runTransaction, serverTimestamp } from 'firebase/firestore';
import { ulid } from '../utils/ulid';
import { StorageRepository } from '../repositories/StorageRepository';
import { VaultFileMetadata } from '../types/storage';
import {
  UploadFailedError,
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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export interface UploadController {
  task: UploadTask;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  fileId: string;
}

export class UploadService {
  private readonly storageRepo = new StorageRepository();

  /**
   * Generates a decoupled storage path for the health vault.
   */
  public generateStoragePath(ownerId: string, fileId: string): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `health-vault/buckets/${ownerId}/${year}/${month}/${fileId}`;
  }

  /**
   * Helper to perform client-side file checksum calculations.
   */
  public async calculateFileHash(file: File | Blob): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Simulated virus scanner integration point.
   */
  private async scanFileForViruses(_file: File | Blob): Promise<boolean> {
    // Integration point: replace with ICAP or ClamAV API call before production deployment
    void _file;
    return true;
  }

  /**
   * Orchestrates the secure upload pipeline.
   */
  public async startUpload(
    file: File,
    context: {
      ownerId: string;
      recordId: string;
      recordType: string;
      uploadedBy: string;
    },
    callbacks: {
      onProgress?: (progress: number) => void;
      onComplete?: (metadata: VaultFileMetadata) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<UploadController> {
    // 1. Validation
    if (!file) {
      throw new InvalidFileError('No file was provided for upload.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new UnsupportedTypeError(file.type);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new InvalidFileError(`File size exceeds the 50 MB limit. Provided size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }

    // 2. Scan
    const scanClean = await this.scanFileForViruses(file);
    if (!scanClean) {
      throw new UploadFailedError('Security alert: The uploaded file failed antivirus scanner validation.');
    }

    // 3. Prepare Metadata & Path
    const fileId = ulid();
    const storagePath = this.generateStoragePath(context.ownerId, fileId);
    const clientHash = await this.calculateFileHash(file);

    const fileRef = ref(storage, storagePath);

    // Attach custom metadata on the physical storage object
    const storageMetadata = {
      customMetadata: {
        fileId,
        ownerId: context.ownerId,
        recordId: context.recordId,
        clientChecksum: clientHash,
      },
    };

    // 4. Resumable Upload Task
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
        // Structured Logging
        console.error('[UploadService] File upload task aborted.', { fileId, error: error.message });
        if (callbacks.onError) {
          callbacks.onError(new UploadFailedError(`File upload failed: ${error.message}`, error));
        }
      },
      async () => {
        // On success: Create file metadata record in database
        const dbMetadata: VaultFileMetadata = {
          fileId,
          ownerId: context.ownerId,
          recordId: context.recordId,
          recordType: context.recordType,
          contentType: file.type,
          originalFileName: file.name,
          fileSize: file.size,
          checksum: clientHash, // Confirmed on server ingest
          hashAlgorithm: 'SHA-256',
          checksumVersion: '1.0.0',
          uploadedAt: serverTimestamp(),
          uploadedBy: context.uploadedBy,
          storagePath,
          status: 'ACTIVE',
          version: 1,
        };

        try {
          await runTransaction(db, async (transaction) => {
            await this.storageRepo.saveFileMetadata(dbMetadata, transaction);
          });

          if (callbacks.onComplete) {
            callbacks.onComplete(dbMetadata);
          }
        } catch (dbErr: unknown) {
          if (callbacks.onError) {
            const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
            callbacks.onError(new UploadFailedError(`Metadata persistence failed: ${msg}`, dbErr));
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
    };
  }
}
export default UploadService;
