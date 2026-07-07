export class VaccinationDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class VaccinationNotFoundError extends VaccinationDomainError {
  constructor(vaccinationId: string) {
    super(`Vaccination record with ID "${vaccinationId}" was not found.`, 'VACCINATION_NOT_FOUND');
  }
}

export class ScheduleNotFoundError extends VaccinationDomainError {
  constructor(scheduleId: string) {
    super(`Vaccination schedule with ID "${scheduleId}" was not found.`, 'SCHEDULE_NOT_FOUND');
  }
}

export class CertificateNotFoundError extends VaccinationDomainError {
  constructor(certificateId: string) {
    super(`Vaccination certificate with ID "${certificateId}" was not found.`, 'CERTIFICATE_NOT_FOUND');
  }
}

export class InvalidStatusTransitionError extends VaccinationDomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition vaccination status from "${from}" to "${to}".`, 'INVALID_STATUS_TRANSITION');
  }
}

export class AdverseEventAlreadyReportedError extends VaccinationDomainError {
  constructor(vaccinationId: string) {
    super(`Adverse event has already been logged for vaccination "${vaccinationId}".`, 'ADVERSE_EVENT_ALREADY_REPORTED');
  }
}
