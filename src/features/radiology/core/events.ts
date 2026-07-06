import { RadiologyStudy, RadiologyReport } from '../types';

export interface RadiologyEvents {
  StudyScheduled: {
    study: RadiologyStudy;
    schedulerId: string;
    timestamp: Date;
  };
  StudyCompleted: {
    study: RadiologyStudy;
    completedAt: Date;
  };
  ReportFinalized: {
    report: RadiologyReport;
    study: RadiologyStudy;
    radiologistId: string;
    timestamp: Date;
  };
  CriticalFindingAlert: {
    studyInstanceUid: string;
    patientId: string;
    patientName: string;
    modality: string;
    findings: string;
    timestamp: Date;
  };
}

type EventListener<T> = (payload: T) => void | Promise<void>;

export class RadiologyEventBus {
  private static instance: RadiologyEventBus;
  private listeners: Record<string, EventListener<never>[]> = {};

  private constructor() {}

  public static getInstance(): RadiologyEventBus {
    if (!RadiologyEventBus.instance) {
      RadiologyEventBus.instance = new RadiologyEventBus();
    }
    return RadiologyEventBus.instance;
  }

  public subscribe<K extends keyof RadiologyEvents>(
    event: K,
    listener: EventListener<RadiologyEvents[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener as EventListener<never>);

    return () => {
      this.listeners[event] = this.listeners[event]?.filter((l) => l !== (listener as EventListener<never>));
    };
  }

  public async publish<K extends keyof RadiologyEvents>(
    event: K,
    payload: RadiologyEvents[K]
  ): Promise<void> {
    const list = this.listeners[event];
    if (!list) return;

    await Promise.all(
      list.map(async (listener) => {
        try {
          await (listener as EventListener<RadiologyEvents[K]>)(payload);
        } catch (err) {
          console.error(`[RadiologyEventBus] Listener error for event "${event}":`, err);
        }
      })
    );
  }

  public reset(): void {
    this.listeners = {};
  }
}
