import { PrescriptionRecord, RefillTransaction } from '../types';

export interface PrescriptionCreatedPayload {
  readonly record: PrescriptionRecord;
  readonly creatorId: string;
  readonly timestamp: Date;
}

export interface PrescriptionUpdatedPayload {
  readonly record: PrescriptionRecord;
  readonly updaterId: string;
  readonly timestamp: Date;
}

export interface PrescriptionExpiredPayload {
  readonly recordId: string;
  readonly timestamp: Date;
}

export interface RefillRequestedPayload {
  readonly transaction: RefillTransaction;
  readonly requesterId: string;
  readonly timestamp: Date;
}

export interface RefillProcessedPayload {
  readonly transaction: RefillTransaction;
  readonly processorId: string;
  readonly timestamp: Date;
}

export interface PrescriptionEvents {
  PrescriptionCreated: PrescriptionCreatedPayload;
  PrescriptionUpdated: PrescriptionUpdatedPayload;
  PrescriptionExpired: PrescriptionExpiredPayload;
  RefillRequested: RefillRequestedPayload;
  RefillAuthorized: RefillProcessedPayload;
  RefillDispensed: RefillProcessedPayload;
  RefillRejected: RefillProcessedPayload;
}

export type PrescriptionEventName = keyof PrescriptionEvents;

type EventCallback<K extends PrescriptionEventName> = (
  payload: PrescriptionEvents[K]
) => void | Promise<void>;

export class PrescriptionEventBus {
  private static instance: PrescriptionEventBus;
  private readonly listeners: {
    [K in PrescriptionEventName]?: Array<EventCallback<K>>;
  } = {};

  private constructor() {}

  public static getInstance(): PrescriptionEventBus {
    if (!PrescriptionEventBus.instance) {
      PrescriptionEventBus.instance = new PrescriptionEventBus();
    }
    return PrescriptionEventBus.instance;
  }

  public subscribe<K extends PrescriptionEventName>(
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

  public async publish<K extends PrescriptionEventName>(
    event: K,
    payload: PrescriptionEvents[K]
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
            `[PrescriptionEventBus] Listener error for event "${event}":`,
            msg
          );
        }
      })
    );
  }

  public reset(): void {
    (Object.keys(this.listeners) as PrescriptionEventName[]).forEach((key) => {
      delete this.listeners[key];
    });
  }
}
