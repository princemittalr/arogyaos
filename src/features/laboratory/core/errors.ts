export class LaboratoryError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'LaboratoryError';
  }
}

export class OrderNotFoundError extends LaboratoryError {
  constructor(requestId: string) {
    super(`Diagnostic request order with ID "${requestId}" not found.`, 'ORDER_NOT_FOUND');
  }
}

export class InvalidSpecimenError extends LaboratoryError {
  constructor(message = 'Invalid or missing specimen collection details.') {
    super(message, 'INVALID_SPECIMEN');
  }
}

export class ObservationValidationError extends LaboratoryError {
  constructor(message = 'Validation failed for laboratory result observations.') {
    super(message, 'OBSERVATION_VALIDATION_FAILED');
  }
}
