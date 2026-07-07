export class WorkflowObservability {
  traceWorkflowMetadataLifecycle(durationMs: number): void {}
  traceTaskMetadataLifecycle(durationMs: number): void {}
  traceSLALifecycle(durationMs: number): void {}
  traceDecisionMetadataLifecycle(durationMs: number): void {}
  traceGovernanceLifecycle(durationMs: number): void {}
  traceCacheMetrics(durationMs: number): void {}
  traceOfflineMetrics(metrics: Record<string, unknown>): void {}
}
