export type DataPlatformEventName =
  | 'master:created'
  | 'master:updated'
  | 'dataset:created'
  | 'dataset:updated'
  | 'pipeline:registered'
  | 'pipeline:updated'
  | 'quality:validated'
  | 'lineage:updated'
  | 'classification:changed'
  | 'retention:updated'
  | 'report:published'
  | 'dashboard:published';

export interface DataPlatformEventPayload<T = unknown> {
  eventId: string;
  eventName: DataPlatformEventName;
  timestamp: string;
  data: T;
}

export class DataPlatformEventBus {
  private static instance: DataPlatformEventBus;
  private listeners: Map<string, Array<(payload: DataPlatformEventPayload) => void>> = new Map();
  
  private constructor() {}

  public static getInstance(): DataPlatformEventBus {
    if (!DataPlatformEventBus.instance) {
      DataPlatformEventBus.instance = new DataPlatformEventBus();
    }
    return DataPlatformEventBus.instance;
  }

  public subscribe(event: DataPlatformEventName, callback: (payload: DataPlatformEventPayload) => void): () => void {
    const list = this.listeners.get(event) || [];
    list.push(callback);
    this.listeners.set(event, list);
    return () => {
      const newList = (this.listeners.get(event) || []).filter(cb => cb !== callback);
      this.listeners.set(event, newList);
    };
  }

  public publish(payload: DataPlatformEventPayload): void {
    const list = this.listeners.get(payload.eventName) || [];
    list.forEach(cb => cb(payload));
  }

  public reset(): void {
    this.listeners.clear();
  }
}
