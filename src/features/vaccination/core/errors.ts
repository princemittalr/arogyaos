// ─── Vaccination Typed Domain Errors ─────────────────────────────────

export class VaccinationDomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class VaccinationNotFoundError extends VaccinationDomainError {
  constructor(vaccinationId: string) {
    super(
      `Vaccination record with ID "${vaccinationId}" was not found.`,
      'VACCINATION_NOT_FOUND'
    );
  }
}

export class CertificateGenerationError extends VaccinationDomainError {
  constructor(vaccinationId: string, reason: string) {
    super(
      `Certificate generation failed for vaccination "${vaccinationId}": ${reason}`,
      'CERTIFICATE_GENERATION_FAILED'
    );
  }
}

export class InvalidDoseError extends VaccinationDomainError {
  constructor(vaccinationId: string, doseNumber: number, totalDoses: number) {
    super(
      `Invalid dose number ${doseNumber} for vaccination "${vaccinationId}". Expected dose between 1 and ${totalDoses}.`,
      'INVALID_DOSE'
    );
  }
}

export class BoosterNotDueError extends VaccinationDomainError {
  constructor(vaccinationId: string, dueDate: string) {
    super(
      `Booster for vaccination "${vaccinationId}" is not due until ${dueDate}.`,
      'BOOSTER_NOT_DUE'
    );
  }
}

export class ScheduleValidationError extends VaccinationDomainError {
  constructor(message: string) {
    super(message, 'SCHEDULE_VALIDATION_ERROR');
  }
}

export class DuplicateVaccinationError extends VaccinationDomainError {
  constructor(patientId: string, vaccineName: string, doseNumber: number) {
    super(
      `A vaccination record for patient "${patientId}" with vaccine "${vaccineName}" dose ${doseNumber} already exists.`,
      'DUPLICATE_VACCINATION'
    );
  }
}

export class UnauthorizedVaccinationAccessError extends VaccinationDomainError {
  constructor(userId: string, vaccinationId: string) {
    super(
      `User "${userId}" is not authorized to access vaccination record "${vaccinationId}".`,
      'UNAUTHORIZED_VACCINATION_ACCESS'
    );
  }
}
