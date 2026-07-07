export type WorkflowEventName =
  | 'workflow:created'
  | 'workflow:updated'
  | 'workflow:published'
  | 'workflow:archived'
  | 'workflow:started'
  | 'workflow:paused'
  | 'workflow:completed'
  | 'workflow:failed'
  | 'workflow:cancelled'
  | 'task:created'
  | 'task:assigned'
  | 'task:completed'
  | 'task:reassigned'
  | 'approval:requested'
  | 'approval:approved'
  | 'approval:rejected'
  | 'escalation:triggered'
  | 'sla:breached'
  | 'rule:evaluated';

export interface WorkflowEventPayload<T = unknown> {
  eventId: string;
  eventName: WorkflowEventName;
  timestamp: string;
  data: T;
}

export class WorkflowEventBus {
  private listeners: Map<string, Array<(payload: WorkflowEventPayload) => void>> = new Map();
  
  subscribe(event: WorkflowEventName, callback: (payload: WorkflowEventPayload) => void): void {
    const list = this.listeners.get(event) || [];
    list.push(callback);
    this.listeners.set(event, list);
  }

  publish(payload: WorkflowEventPayload): void {
    const list = this.listeners.get(payload.eventName) || [];
    list.forEach(cb => cb(payload));
  }
}
