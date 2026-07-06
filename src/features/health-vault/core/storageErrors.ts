import { HealthVaultError } from './errors';

export class UploadFailedError extends HealthVaultError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 'UPLOAD_FAILED');
    this.details = details;
  }
}

export class DownloadDeniedError extends HealthVaultError {
  constructor(message: string = 'Access denied. You do not have permissions to download this file.') {
    super(message, 'DOWNLOAD_DENIED');
  }
}

export class InvalidFileError extends HealthVaultError {
  constructor(message: string) {
    super(message, 'INVALID_FILE_STRUCTURE');
  }
}

export class UnsupportedTypeError extends HealthVaultError {
  constructor(mimeType: string) {
    super(`File type "${mimeType}" is not supported by Health Vault. Only PDFs, Images, and Text are allowed.`, 'UNSUPPORTED_FILE_TYPE');
  }
}

export class IntegrityCheckFailedError extends HealthVaultError {
  constructor(fileId: string) {
    super(`Integrity verification failed for file "${fileId}". The generated checksum does not match metadata.`, 'INTEGRITY_CHECK_FAILED');
  }
}

export class StorageUnavailableError extends HealthVaultError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 'STORAGE_UNAVAILABLE');
    this.details = details;
  }
}
