import { LabTestRequest, LabReportRecord } from '../types';

export interface SampleCollectedPayload {
  readonly request: LabTestRequest;
  readonly collectorId: string;
  readonly timestamp: Date;
}

export interface ReportFinalizedPayload {
  readonly report: LabReportRecord;
  readonly technicianId: string;
  readonly timestamp: Date;
}

export interface CriticalResultPayload {
  readonly report: LabReportRecord;
  readonly parameterName: string;
  readonly value: string;
  readonly timestamp: Date;
}

export interface LaboratoryEvents {
  SampleCollected: SampleCollectedPayload;
  ReportFinalized: ReportFinalizedPayload;
  CriticalResultAlert: CriticalResultPayload;
}

export type LaboratoryEventName = keyof LaboratoryEvents;

type EventCallback<K extends LaboratoryEventName> = (
  payload: LaboratoryEvents[K]
) => void | Promise<void>;

export class LaboratoryEventBus {
  private static instance: LaboratoryEventBus;
  private readonly listeners: {
    [K in LaboratoryEventName]?: Array<EventCallback<K>>;
  } = {};

  private constructor() {}

  public static getInstance(): LaboratoryEventBus {
    if (!LaboratoryEventBus.instance) {
      LaboratoryEventBus.instance = new LaboratoryEventBus();
    }
    return LaboratoryEventBus.instance;
  }

  public subscribe<K extends LaboratoryEventName>(
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

  public async publish<K extends LaboratoryEventName>(
    event: K,
    payload: LaboratoryEvents[K]
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
            `[LaboratoryEventBus] Listener error for event "${event}":`,
            msg
          );
        }
      })
    );
  }

  public reset(): void {
    (Object.keys(this.listeners) as LaboratoryEventName[]).forEach((key) => {
      delete this.listeners[key];
    });
  }
}
export default LaboratoryEventBus;
