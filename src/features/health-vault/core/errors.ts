// ─── Health Vault Typed Domain Errors ────────────────────────────────────────

export class HealthVaultError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends HealthVaultError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class UnauthorizedError extends HealthVaultError {
  constructor(message: string = 'Access denied. Insufficient privileges.') {
    super(message, 'UNAUTHORIZED_ACCESS');
  }
}

export class NotFoundError extends HealthVaultError {
  constructor(resourceName: string, identifier: string) {
    super(`${resourceName} with identifier "${identifier}" was not found.`, 'RESOURCE_NOT_FOUND');
  }
}

export class TamperError extends HealthVaultError {
  constructor(recordId: string) {
    super(`Security Alert: Checksum validation failed for record "${recordId}". Possible tamper detected.`, 'RECORD_TAMPERED');
  }
}

export class ConcurrencyError extends HealthVaultError {
  constructor(message: string = 'Concurrency conflict detected. Document was modified by another transaction.') {
    super(message, 'CONCURRENCY_CONFLICT');
  }
}

export class StorageError extends HealthVaultError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 'STORAGE_OPERATION_FAILED');
    this.details = details;
  }
}
