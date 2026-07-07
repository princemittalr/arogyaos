import { withRetry, createAbortSignal } from '@/features/health-vault/utils/retry';
import type { RetryOptions } from '@/features/health-vault/utils/retry';

export const STANDARD_RETRY: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 300,
  backoffFactor: 2,
  maxDelayMs: 5000,
};

export const AGGRESSIVE_RETRY: RetryOptions = {
  maxAttempts: 5,
  initialDelayMs: 200,
  backoffFactor: 2,
  maxDelayMs: 10000,
};

export function appointmentRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  return withRetry(operation, { ...STANDARD_RETRY, ...options });
}

export function appointmentAggressiveRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<T> {
  return withRetry(operation, { ...AGGRESSIVE_RETRY, ...options });
}

export { createAbortSignal };
export type { RetryOptions };
