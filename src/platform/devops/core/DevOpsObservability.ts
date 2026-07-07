export class DevOpsObservability {
  private static instance: DevOpsObservability;

  private constructor() {}

  public static getInstance(): DevOpsObservability {
    if (!DevOpsObservability.instance) DevOpsObservability.instance = new DevOpsObservability();
    return DevOpsObservability.instance;
  }

  public trackLifecycle(entity: string, event: string, metadata?: Record<string, unknown>): void {
    console.log(`[Observability] ${entity} - ${event}`, metadata);
  }

  public trackMetric(metric: string, value: number, tags?: Record<string, string>): void {
    console.log(`[Metric] ${metric}: ${value}`, tags);
  }
}
