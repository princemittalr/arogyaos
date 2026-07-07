export class AppointmentsDomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AppointmentNotFoundError extends AppointmentsDomainError {
  constructor(appointmentId: string) {
    super(`Appointment with ID "${appointmentId}" was not found.`, 'APPOINTMENT_NOT_FOUND');
  }
}

export class SlotUnavailableError extends AppointmentsDomainError {
  constructor(slotId: string) {
    super(`Slot "${slotId}" is no longer available.`, 'SLOT_UNAVAILABLE');
  }
}

export class DoubleBookingError extends AppointmentsDomainError {
  constructor(providerId: string, date: string, startTime: string) {
    super(`Provider "${providerId}" is already booked on ${date} at ${startTime}.`, 'DOUBLE_BOOKING');
  }
}

export class ScheduleConflictError extends AppointmentsDomainError {
  constructor(resourceId: string, reason: string) {
    super(`Schedule conflict for "${resourceId}": ${reason}`, 'SCHEDULE_CONFLICT');
  }
}

export class UnauthorizedAppointmentAccessError extends AppointmentsDomainError {
  constructor(userId: string, appointmentId: string) {
    super(`User "${userId}" is not authorized to access appointment "${appointmentId}".`, 'UNAUTHORIZED_APPOINTMENT_ACCESS');
  }
}

export class InvalidAppointmentStateError extends AppointmentsDomainError {
  constructor(appointmentId: string, currentStatus: string, expectedStatus: string) {
    super(`Appointment "${appointmentId}" is in status "${currentStatus}", expected "${expectedStatus}".`, 'INVALID_APPOINTMENT_STATE');
  }
}

export class RescheduleLimitExceededError extends AppointmentsDomainError {
  constructor(appointmentId: string, limit: number) {
    super(`Appointment "${appointmentId}" has exceeded the maximum reschedule limit of ${limit}.`, 'RESCHEDULE_LIMIT_EXCEEDED');
  }
}

export class CancellationWindowExpiredError extends AppointmentsDomainError {
  constructor(appointmentId: string, windowHours: number) {
    super(`Cancellation window of ${windowHours} hours has expired for appointment "${appointmentId}".`, 'CANCELLATION_WINDOW_EXPIRED');
  }
}
