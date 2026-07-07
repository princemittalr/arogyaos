import { WorkflowEventBus } from '../core/events';
export class TimelineIntegrationService {
  constructor(private readonly eventBus: WorkflowEventBus) {
    this.initializeSubscriptions();
  }
  private initializeSubscriptions(): void {
    this.eventBus.subscribe('workflow:created', async (payload) => { /* Publish */ });
    this.eventBus.subscribe('workflow:started', async (payload) => { /* Publish */ });
  }
}
