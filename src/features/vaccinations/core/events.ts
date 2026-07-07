import { Vaccination, VaccinationSchedule, VaccinationCertificate, AdverseEvent } from '../types';

export interface VaccinationEvents {
  VaccineScheduled: {
    schedule: VaccinationSchedule;
    timestamp: Date;
  };
  VaccineAdministered: {
    vaccination: Vaccination;
    timestamp: Date;
  };
  VaccineVerified: {
    vaccinationId: string;
    verifiedBy: string;
    timestamp: Date;
  };
  BoosterDue: {
    patientId: string;
    vaccineName: string;
    dueDate: Date;
    timestamp: Date;
  };
  CertificateGenerated: {
    certificate: VaccinationCertificate;
    timestamp: Date;
  };
  AdverseEventRecorded: {
    vaccinationId: string;
    adverseEvent: AdverseEvent;
    timestamp: Date;
  };
}

type EventListener<T> = (payload: T) => void | Promise<void>;

export class VaccinationEventBus {
  private static instance: VaccinationEventBus;
  private listeners: Record<string, EventListener<never>[]> = {};

  private constructor() {}

  public static getInstance(): VaccinationEventBus {
    if (!VaccinationEventBus.instance) {
      VaccinationEventBus.instance = new VaccinationEventBus();
    }
    return VaccinationEventBus.instance;
  }

  public subscribe<K extends keyof VaccinationEvents>(
    event: K,
    listener: EventListener<VaccinationEvents[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener as EventListener<never>);

    return () => {
      this.listeners[event] = this.listeners[event]?.filter((l) => l !== (listener as EventListener<never>));
    };
  }

  public async publish<K extends keyof VaccinationEvents>(
    event: K,
    payload: VaccinationEvents[K]
  ): Promise<void> {
    const list = this.listeners[event];
    if (!list) return;

    await Promise.all(
      list.map(async (listener) => {
        try {
          await (listener as EventListener<VaccinationEvents[K]>)(payload);
        } catch (err) {
          console.error(`[VaccinationEventBus] Listener error for event "${event}":`, err);
        }
      })
    );
  }

  public reset(): void {
    this.listeners = {};
  }
}
