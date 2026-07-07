import type { Appointment } from '../types';

export interface AppointmentCreatedPayload {
  readonly appointment: Appointment;
  readonly createdBy: string;
  readonly timestamp: Date;
}

export interface AppointmentConfirmedPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly confirmedBy: string;
  readonly timestamp: Date;
}

export interface AppointmentCancelledPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly cancelledBy: string;
  readonly reason: string;
  readonly timestamp: Date;
}

export interface AppointmentRescheduledPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly previousDate: string;
  readonly newDate: string;
  readonly rescheduledBy: string;
  readonly timestamp: Date;
}

export interface AppointmentCheckedInPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly checkInTime: string;
  readonly checkedInBy: string;
  readonly timestamp: Date;
}

export interface AppointmentStartedPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly providerId: string;
  readonly startTime: string;
  readonly timestamp: Date;
}

export interface AppointmentCompletedPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly providerId: string;
  readonly endTime: string;
  readonly timestamp: Date;
}

export interface AppointmentNoShowPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly scheduledDate: string;
  readonly timestamp: Date;
}

export interface ReminderTriggeredPayload {
  readonly appointmentId: string;
  readonly patientId: string;
  readonly reminderType: string;
  readonly reminderId: string;
  readonly timestamp: Date;
}

export interface WaitingListPromotedPayload {
  readonly entryId: string;
  readonly patientId: string;
  readonly slotId: string;
  readonly appointmentId?: string;
  readonly timestamp: Date;
}

export interface AppointmentEvents {
  AppointmentCreated: AppointmentCreatedPayload;
  AppointmentConfirmed: AppointmentConfirmedPayload;
  AppointmentCancelled: AppointmentCancelledPayload;
  AppointmentRescheduled: AppointmentRescheduledPayload;
  AppointmentCheckedIn: AppointmentCheckedInPayload;
  AppointmentStarted: AppointmentStartedPayload;
  AppointmentCompleted: AppointmentCompletedPayload;
  AppointmentNoShow: AppointmentNoShowPayload;
  ReminderTriggered: ReminderTriggeredPayload;
  WaitingListPromoted: WaitingListPromotedPayload;
}

export type AppointmentEventName = keyof AppointmentEvents;

type EventCallback<K extends AppointmentEventName> = (
  payload: AppointmentEvents[K]
) => void | Promise<void>;

export class AppointmentEventBus {
  private static instance: AppointmentEventBus;
  private readonly listeners: {
    [K in AppointmentEventName]?: Array<EventCallback<K>>;
  } = {};

  private constructor() {}

  public static getInstance(): AppointmentEventBus {
    if (!AppointmentEventBus.instance) {
      AppointmentEventBus.instance = new AppointmentEventBus();
    }
    return AppointmentEventBus.instance;
  }

  public subscribe<K extends AppointmentEventName>(
    event: K,
    callback: EventCallback<K>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    (this.listeners[event] as Array<EventCallback<K>>).push(callback);
    return () => {
      const list = this.listeners[event] as Array<EventCallback<K>> | undefined;
      if (list) {
        this.listeners[event] = list.filter(
          (cb) => cb !== callback
        ) as typeof this.listeners[K];
      }
    };
  }

  public async publish<K extends AppointmentEventName>(
    event: K,
    payload: AppointmentEvents[K]
  ): Promise<void> {
    const list = this.listeners[event];
    if (!list || list.length === 0) return;
    await Promise.all(
      (list as Array<EventCallback<K>>).map(async (callback) => {
        try { await callback(payload); }
        catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[AppointmentEventBus] Listener error for event "${event}":`, msg);
        }
      })
    );
  }

  public reset(): void {
    (Object.keys(this.listeners) as AppointmentEventName[]).forEach((key) => {
      delete this.listeners[key];
    });
  }
}
