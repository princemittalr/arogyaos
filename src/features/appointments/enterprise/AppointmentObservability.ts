import { vaultObservability } from '@/features/health-vault/services/VaultObservability';

export const APPOINTMENT_OBSERVABILITY_OPERATIONS = {
  APPOINTMENT_CREATION: 'appointment.create',
  APPOINTMENT_CONFIRMATION: 'appointment.confirm',
  APPOINTMENT_CANCELLATION: 'appointment.cancel',
  APPOINTMENT_RESCHEDULE: 'appointment.reschedule',
  APPOINTMENT_CHECK_IN: 'appointment.checkin',
  APPOINTMENT_COMPLETION: 'appointment.complete',
  CALENDAR_LOADING: 'appointment.calendar.load',
  AVAILABILITY_LOADING: 'appointment.availability.load',
  WAITING_LIST_PROCESSING: 'appointment.waitinglist.process',
  STATISTICS_LOADING: 'appointment.statistics.load',
  FOLLOW_UP_LOADING: 'appointment.followup.load',
} as const;

function withObservability<T>(
  operationName: string,
  operation: () => Promise<T>,
  meta?: Record<string, string | number | boolean>,
): Promise<T> {
  const span = vaultObservability.startSpan(operationName);
  return operation()
    .then((result) => {
      span.end('success', meta);
      vaultObservability.increment(`${operationName}.success`, meta);
      return result;
    })
    .catch((error: unknown) => {
      const errorCode = error instanceof Error ? error.name : 'UnknownError';
      span.end('failure', { ...meta, errorCode: errorCode });
      vaultObservability.recordError(operationName, errorCode, meta);
      vaultObservability.increment(`${operationName}.failure`, meta);
      throw error;
    });
}

export class AppointmentObservability {
  private static instance: AppointmentObservability;

  private constructor() {}

  public static getInstance(): AppointmentObservability {
    if (!AppointmentObservability.instance) {
      AppointmentObservability.instance = new AppointmentObservability();
    }
    return AppointmentObservability.instance;
  }

  public async trackCreation<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.APPOINTMENT_CREATION, op, meta);
  }

  public async trackConfirmation<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.APPOINTMENT_CONFIRMATION, op, meta);
  }

  public async trackCancellation<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.APPOINTMENT_CANCELLATION, op, meta);
  }

  public async trackReschedule<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.APPOINTMENT_RESCHEDULE, op, meta);
  }

  public async trackCheckIn<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.APPOINTMENT_CHECK_IN, op, meta);
  }

  public async trackCompletion<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.APPOINTMENT_COMPLETION, op, meta);
  }

  public async trackCalendarLoad<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.CALENDAR_LOADING, op, meta);
  }

  public async trackAvailabilityLoad<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.AVAILABILITY_LOADING, op, meta);
  }

  public async trackWaitingListProcessing<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.WAITING_LIST_PROCESSING, op, meta);
  }

  public async trackStatisticsLoad<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.STATISTICS_LOADING, op, meta);
  }

  public async trackFollowUpLoad<T>(op: () => Promise<T>, meta?: Record<string, string | number | boolean>): Promise<T> {
    return withObservability(APPOINTMENT_OBSERVABILITY_OPERATIONS.FOLLOW_UP_LOADING, op, meta);
  }
}

export const appointmentObservability = AppointmentObservability.getInstance();
