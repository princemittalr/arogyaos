export type DevOpsEventName =
  | 'environment:created'
  | 'environment:updated'
  | 'deployment:started'
  | 'deployment:completed'
  | 'deployment:failed'
  | 'release:published'
  | 'pipeline:started'
  | 'pipeline:completed'
  | 'featureflag:updated'
  | 'configuration:changed'
  | 'service:registered'
  | 'health:updated'
  | 'alert:triggered'
  | 'incident:opened'
  | 'incident:resolved'
  | 'backup:completed'
  | 'restore:completed';

export interface DevOpsEventPayload<T = unknown> {
  eventId: string;
  eventName: DevOpsEventName;
  timestamp: string;
  data: T;
}

export class DevOpsEventBus {
  private static instance: DevOpsEventBus;
  private listeners: Map<string, Array<(payload: DevOpsEventPayload) => void>> = new Map();
  
  private constructor() {}

  static getInstance(): DevOpsEventBus {
    if (!DevOpsEventBus.instance) {
      DevOpsEventBus.instance = new DevOpsEventBus();
    }
    return DevOpsEventBus.instance;
  }

  subscribe(event: DevOpsEventName, callback: (payload: DevOpsEventPayload) => void): () => void {
    const list = this.listeners.get(event) || [];
    list.push(callback);
    this.listeners.set(event, list);
    return () => {
      const newList = (this.listeners.get(event) || []).filter(cb => cb !== callback);
      this.listeners.set(event, newList);
    };
  }

  publish(payload: DevOpsEventPayload): void {
    const list = this.listeners.get(payload.eventName) || [];
    list.forEach(cb => cb(payload));
  }

  reset(): void {
    this.listeners.clear();
  }
}
