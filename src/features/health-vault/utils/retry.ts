/**
 * Health Vault — Retry Utility
 *
 * Provides exponential backoff retry with jitter for transient network failures.
 * Automatically aborts stale requests using AbortController.
 *
 * Retryable errors:
 * - Network timeouts
 * - Firestore unavailable (codes: unavailable, deadline-exceeded)
 * - HTTP 429, 503
 *
 * Non-retryable errors (throw immediately):
 * - ValidationError, UnauthorizedError, NotFoundError (logical errors)
 * - AbortError (explicit cancellation)
 */

import { ValidationError, UnauthorizedError, NotFoundError } from '../core/errors';

export interface RetryOptions {
  /** Maximum number of attempts (including the first) */
  maxAttempts: number;
  /** Initial backoff delay in ms */
  initialDelayMs: number;
  /** Backoff multiplier */
  backoffFactor: number;
  /** Maximum delay cap in ms */
  maxDelayMs: number;
  /** AbortSignal for external cancellation */
  signal?: AbortSignal;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 300,
  backoffFactor: 2,
  maxDelayMs: 5000,
};

function isRetryableError(err: unknown): boolean {
  if (err instanceof ValidationError) return false;
  if (err instanceof UnauthorizedError) return false;
  if (err instanceof NotFoundError) return false;
  if (err instanceof DOMException && err.name === 'AbortError') return false;

  // Firestore error codes that are transient
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    if (['unavailable', 'deadline-exceeded', 'resource-exhausted'].includes(code)) {
      return true;
    }
  }

  // Generic network errors
  if (err instanceof TypeError && err.message.includes('fetch')) return true;

  return true; // Default: retry unknown errors
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Operation aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Operation aborted', 'AbortError'));
    }, { once: true });
  });
}

/**
 * Execute an async operation with exponential backoff retry.
 *
 * @example
 * const result = await withRetry(() => firestoreRead(), { maxAttempts: 3 });
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let lastError: unknown;
  let delayMs = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      opts.signal?.throwIfAborted?.();
      return await operation();
    } catch (err: unknown) {
      lastError = err;

      if (!isRetryableError(err)) {
        throw err;
      }

      if (attempt === opts.maxAttempts) break;

      // Add ±20% jitter to prevent thundering herd
      const jitter = (Math.random() - 0.5) * 0.4 * delayMs;
      const actualDelay = Math.min(opts.maxDelayMs, delayMs + jitter);

      console.warn(`[withRetry] Attempt ${attempt}/${opts.maxAttempts} failed. Retrying in ${Math.round(actualDelay)}ms.`);

      await sleep(actualDelay, opts.signal);
      delayMs = Math.min(opts.maxDelayMs, delayMs * opts.backoffFactor);
    }
  }

  throw lastError;
}

/**
 * Create a timeout-bounded AbortController.
 * Returns the controller; call .abort() to cancel early.
 *
 * @example
 * const { signal, cleanup } = createAbortSignal(10_000);
 * try { await fetch(url, { signal }); } finally { cleanup(); }
 */
export function createAbortSignal(timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}
