/**
 * Health Vault — Observability Hook
 *
 * Provides a React-idiomatic interface to the VaultObservability service.
 * Automatically measures component-level operation latencies.
 *
 * Usage:
 *   const { startSpan, recordError } = useVaultObservability();
 *   const span = startSpan('drawer.load');
 *   try { ... } finally { span.end('success', { recordType }); }
 */

'use client';

import { useCallback, useMemo } from 'react';
import { vaultObservability, ObservabilitySpan } from '../services/VaultObservability';

export interface UseVaultObservabilityReturn {
  startSpan: (operationName: string) => ObservabilitySpan;
  recordError: (operationName: string, errorCode: string, meta?: Record<string, string | number | boolean>) => void;
  increment: (metric: string, meta?: Record<string, string | number | boolean>) => void;
}

export function useVaultObservability(): UseVaultObservabilityReturn {
  const startSpan = useCallback(
    (operationName: string): ObservabilitySpan => vaultObservability.startSpan(operationName),
    []
  );

  const recordError = useCallback(
    (operationName: string, errorCode: string, meta?: Record<string, string | number | boolean>): void => {
      vaultObservability.recordError(operationName, errorCode, meta);
    },
    []
  );

  const increment = useCallback(
    (metric: string, meta?: Record<string, string | number | boolean>): void => {
      vaultObservability.increment(metric, meta);
    },
    []
  );

  return useMemo(() => ({ startSpan, recordError, increment }), [startSpan, recordError, increment]);
}
