/**
 * Health Vault — Observability Service
 *
 * Structured, provider-agnostic performance and error telemetry.
 *
 * Design principles:
 * - NEVER log PHI (record titles, patient names, diagnoses, medications, etc.)
 * - NEVER log record contents
 * - Latency, success/failure counts, and operational metadata only
 * - Adapters allow wiring to Firebase Performance, OpenTelemetry, Sentry, or GCL
 *   without coupling the core service to any provider
 */

export interface ObservabilitySpan {
  readonly operationName: string;
  readonly startTime: number; // performance.now()
  end(outcome: 'success' | 'failure', meta?: Record<string, string | number | boolean>): void;
}

export interface ObservabilityAdapter {
  /** Called on span completion */
  recordSpan(
    operationName: string,
    latencyMs: number,
    outcome: 'success' | 'failure',
    meta?: Record<string, string | number | boolean>
  ): void;

  /** Called for structured error events */
  recordError(
    operationName: string,
    errorCode: string,
    meta?: Record<string, string | number | boolean>
  ): void;

  /** Called for counter increments */
  increment(
    metric: string,
    meta?: Record<string, string | number | boolean>
  ): void;
}

/** Console-based adapter — default for development; replace with real adapters in production */
class ConsoleObservabilityAdapter implements ObservabilityAdapter {
  recordSpan(
    operationName: string,
    latencyMs: number,
    outcome: 'success' | 'failure',
    meta?: Record<string, string | number | boolean>
  ): void {
    if (process.env.NODE_ENV === 'development') {
      console.info('[HV:Observability]', {
        op: operationName,
        latencyMs: Math.round(latencyMs),
        outcome,
        ...meta,
      });
    }
  }

  recordError(
    operationName: string,
    errorCode: string,
    meta?: Record<string, string | number | boolean>
  ): void {
    console.warn('[HV:Observability:Error]', { op: operationName, errorCode, ...meta });
  }

  increment(metric: string, meta?: Record<string, string | number | boolean>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[HV:Observability:Count]', { metric, ...meta });
    }
  }
}

/**
 * Provider-agnostic observability facade for Health Vault.
 * Singleton. Adapters can be registered at application startup.
 */
export class VaultObservability {
  private static instance: VaultObservability;
  private adapters: ObservabilityAdapter[] = [new ConsoleObservabilityAdapter()];

  private constructor() {}

  public static getInstance(): VaultObservability {
    if (!VaultObservability.instance) {
      VaultObservability.instance = new VaultObservability();
    }
    return VaultObservability.instance;
  }

  /**
   * Register an additional observability adapter (e.g. OpenTelemetry, Sentry).
   * Adapters receive all telemetry events without requiring core changes.
   */
  public registerAdapter(adapter: ObservabilityAdapter): void {
    this.adapters.push(adapter);
  }

  /**
   * Start a measurement span. Call .end() when the operation completes.
   *
   * Usage:
   *   const span = observability.startSpan('timeline.load');
   *   try { ... } finally { span.end('success', { recordCount: n }); }
   */
  public startSpan(operationName: string): ObservabilitySpan {
    const startTime = performance.now();
    const adapters = this.adapters;

    return {
      operationName,
      startTime,
      end(outcome, meta) {
        const latencyMs = performance.now() - startTime;
        adapters.forEach((a) => a.recordSpan(operationName, latencyMs, outcome, meta));
      },
    };
  }

  /**
   * Record a structured error event.
   * MUST NOT include PHI — errorCode and meta only.
   */
  public recordError(
    operationName: string,
    errorCode: string,
    meta?: Record<string, string | number | boolean>
  ): void {
    this.adapters.forEach((a) => a.recordError(operationName, errorCode, meta));
  }

  /** Increment a named counter metric */
  public increment(metric: string, meta?: Record<string, string | number | boolean>): void {
    this.adapters.forEach((a) => a.increment(metric, meta));
  }
}

/** Module-level singleton accessor */
export const vaultObservability = VaultObservability.getInstance();
