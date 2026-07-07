export class InteroperabilityError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'InteroperabilityError';
  }
}

export class FHIRValidationError extends InteroperabilityError {
  constructor(id: string) { super(`FHIR validation error on ${id}`, 'FHIR_VALIDATION_ERROR', { id }); this.name = 'FHIRValidationError'; }
}

export class HL7ValidationError extends InteroperabilityError {
  constructor(id: string) { super(`HL7 validation error on ${id}`, 'HL7_VALIDATION_ERROR', { id }); this.name = 'HL7ValidationError'; }
}

export class DICOMValidationError extends InteroperabilityError {
  constructor(id: string) { super(`DICOM validation error on ${id}`, 'DICOM_VALIDATION_ERROR', { id }); this.name = 'DICOMValidationError'; }
}

export class TerminologyError extends InteroperabilityError {
  constructor(id: string) { super(`Terminology error on ${id}`, 'TERMINOLOGY_ERROR', { id }); this.name = 'TerminologyError'; }
}

export class TransformationError extends InteroperabilityError {
  constructor(id: string) { super(`Transformation error on ${id}`, 'TRANSFORMATION_ERROR', { id }); this.name = 'TransformationError'; }
}

export class SynchronizationError extends InteroperabilityError {
  constructor(id: string) { super(`Synchronization error on ${id}`, 'SYNCHRONIZATION_ERROR', { id }); this.name = 'SynchronizationError'; }
}

export class ExchangeError extends InteroperabilityError {
  constructor(id: string) { super(`Exchange error on ${id}`, 'EXCHANGE_ERROR', { id }); this.name = 'ExchangeError'; }
}

export class ValidationProfileError extends InteroperabilityError {
  constructor(id: string) { super(`Validation profile error on ${id}`, 'VALIDATION_PROFILE_ERROR', { id }); this.name = 'ValidationProfileError'; }
}

export class PartnerConfigurationError extends InteroperabilityError {
  constructor(id: string) { super(`Partner configuration error on ${id}`, 'PARTNER_CONFIG_ERROR', { id }); this.name = 'PartnerConfigurationError'; }
}
