export class InteroperabilityObservability {
  traceFHIRMetadataLifecycle(durationMs: number): void {}
  traceHL7MetadataLifecycle(durationMs: number): void {}
  traceDICOMMetadataLifecycle(durationMs: number): void {}
  traceTerminologyLifecycle(durationMs: number): void {}
  traceExchangeLifecycle(durationMs: number): void {}
  traceSynchronizationLifecycle(durationMs: number): void {}
  traceCacheMetrics(durationMs: number): void {}
  traceOfflineMetrics(metrics: Record<string, unknown>): void {}
}
