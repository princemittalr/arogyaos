import {
  VaccineSchedule,
  VaccinationRecord,
  VaccineCertificate,
  AdverseEvent,
  BoosterRecord,
} from '../types';

// ─── Event Payload Contracts ─────────────────────────────────────────

export interface VaccinationScheduledPayload {
  readonly schedule: VaccineSchedule;
  readonly scheduledBy: string;
  readonly timestamp: Date;
}

export interface VaccinationAdministeredPayload {
  readonly vaccination: VaccinationRecord;
  readonly administeredBy: string;
  readonly timestamp: Date;
}

export interface VaccinationVerifiedPayload {
  readonly vaccinationId: string;
  readonly verifiedBy: string;
  readonly timestamp: Date;
}

export interface BoosterDuePayload {
  readonly booster: BoosterRecord;
  readonly patientId: string;
  readonly vaccineName: string;
  readonly dueDate: Date;
  readonly timestamp: Date;
}

export interface CertificateGeneratedPayload {
  readonly certificate: VaccineCertificate;
  readonly generatedBy: string;
  readonly timestamp: Date;
}

export interface AdverseEventRecordedPayload {
  readonly vaccinationId: string;
  readonly adverseEvent: AdverseEvent;
  readonly recordedBy: string;
  readonly timestamp: Date;
}

export interface VaccinationArchivedPayload {
  readonly vaccinationId: string;
  readonly archivedBy: string;
  readonly timestamp: Date;
}

export interface VaccinationRestoredPayload {
  readonly vaccinationId: string;
  readonly restoredBy: string;
  readonly timestamp: Date;
}

// ─── Event Map ───────────────────────────────────────────────────────

export interface VaccinationEvents {
  VaccinationScheduled: VaccinationScheduledPayload;
  VaccinationAdministered: VaccinationAdministeredPayload;
  VaccinationVerified: VaccinationVerifiedPayload;
  BoosterDue: BoosterDuePayload;
  CertificateGenerated: CertificateGeneratedPayload;
  AdverseEventRecorded: AdverseEventRecordedPayload;
  VaccinationArchived: VaccinationArchivedPayload;
  VaccinationRestored: VaccinationRestoredPayload;
}

export type VaccinationEventName = keyof VaccinationEvents;

// ─── Event Bus ───────────────────────────────────────────────────────

type EventCallback<K extends VaccinationEventName> = (
  payload: VaccinationEvents[K]
) => void | Promise<void>;

export class VaccinationEventBus {
  private static instance: VaccinationEventBus;
  private readonly listeners: {
    [K in VaccinationEventName]?: Array<EventCallback<K>>;
  } = {};

  private constructor() {}

  public static getInstance(): VaccinationEventBus {
    if (!VaccinationEventBus.instance) {
      VaccinationEventBus.instance = new VaccinationEventBus();
    }
    return VaccinationEventBus.instance;
  }

  public subscribe<K extends VaccinationEventName>(
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

  public async publish<K extends VaccinationEventName>(
    event: K,
    payload: VaccinationEvents[K]
  ): Promise<void> {
    const list = this.listeners[event];
    if (!list || list.length === 0) return;

    await Promise.all(
      (list as Array<EventCallback<K>>).map(async (callback) => {
        try {
          await callback(payload);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[VaccinationEventBus] Listener error for event "${event}":`,
            msg
          );
        }
      })
    );
  }

  public reset(): void {
    (Object.keys(this.listeners) as VaccinationEventName[]).forEach((key) => {
      delete this.listeners[key];
    });
  }
}
