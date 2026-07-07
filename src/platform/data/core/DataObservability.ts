export class DataObservability {
  private static instance: DataObservability;

  private constructor() {}

  public static getInstance(): DataObservability {
    if (!DataObservability.instance) DataObservability.instance = new DataObservability();
    return DataObservability.instance;
  }

  public trackLifecycle(entity: string, event: string, metadata?: Record<string, unknown>): void {
    console.log(`[Observability] ${entity} - ${event}`, metadata);
  }

  public trackMetric(metric: string, value: number, tags?: Record<string, string>): void {
    console.log(`[Metric] ${metric}: ${value}`, tags);
  }
}
