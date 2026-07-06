export class PrescriptionDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'PrescriptionDomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RefillLimitExceededError extends PrescriptionDomainError {
  constructor(message = 'No remaining refills allowed on this prescription.') {
    super(message, 'REFILL_LIMIT_EXCEEDED');
    this.name = 'RefillLimitExceededError';
  }
}

export class PrescriptionExpiredError extends PrescriptionDomainError {
  constructor(message = 'Cannot request refills on an expired prescription.') {
    super(message, 'PRESCRIPTION_EXPIRED');
    this.name = 'PrescriptionExpiredError';
  }
}

export class RefillIntervalError extends PrescriptionDomainError {
  constructor(message = 'Refill requested too early since last dispense.') {
    super(message, 'REFILL_INTERVAL_TOO_SHORT');
    this.name = 'RefillIntervalError';
  }
}
