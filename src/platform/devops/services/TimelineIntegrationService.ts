import { DevOpsEventBus, DevOpsEventName } from '../core/events';

export class TimelineIntegrationService {
  private static instance: TimelineIntegrationService;
  private bus = DevOpsEventBus.getInstance();

  private constructor() {}

  public static getInstance(): TimelineIntegrationService {
    if (!TimelineIntegrationService.instance) {
      TimelineIntegrationService.instance = new TimelineIntegrationService();
    }
    return TimelineIntegrationService.instance;
  }

  public async publishEvent(eventName: DevOpsEventName, data: unknown): Promise<void> {
    this.bus.publish({
      eventId: crypto.randomUUID(),
      eventName,
      timestamp: new Date().toISOString(),
      data
    });
  }
}
