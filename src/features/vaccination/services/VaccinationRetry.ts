import { withRetry, RetryOptions, createAbortSignal } from '@/features/health-vault/utils/retry';

export { createAbortSignal };
export type { RetryOptions };

const VACCINATION_RETRY_DEFAULTS: Partial<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffFactor: 2,
  maxDelayMs: 8000,
};

const VACCINATION_RETRY_AGGRESSIVE: Partial<RetryOptions> = {
  maxAttempts: 5,
  initialDelayMs: 300,
  backoffFactor: 2,
  maxDelayMs: 10000,
};

export async function vaccinationRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  return withRetry(operation, { ...VACCINATION_RETRY_DEFAULTS, ...options });
}

export async function vaccinationRetryAggressive<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  return withRetry(operation, { ...VACCINATION_RETRY_AGGRESSIVE, ...options });
}

export async function retryVaccinationFetch<T>(
  operation: () => Promise<T>,
  timeoutMs?: number,
): Promise<T> {
  if (timeoutMs) {
    const { signal, cleanup } = createAbortSignal(timeoutMs);
    try {
      return await withRetry(operation, { ...VACCINATION_RETRY_DEFAULTS, signal });
    } finally {
      cleanup();
    }
  }
  return withRetry(operation, VACCINATION_RETRY_DEFAULTS);
}
