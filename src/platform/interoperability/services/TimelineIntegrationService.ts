import { InteroperabilityEventBus } from '../core/events';
export class TimelineIntegrationService {
  constructor(private readonly eventBus: InteroperabilityEventBus) {
    this.initializeSubscriptions();
  }
  private initializeSubscriptions(): void {
    this.eventBus.subscribe('exchange:started', async (payload) => { /* Publish */ });
    this.eventBus.subscribe('sync:started', async (payload) => { /* Publish */ });
  }
}
