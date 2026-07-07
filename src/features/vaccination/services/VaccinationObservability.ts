import { vaultObservability, ObservabilitySpan } from '@/features/health-vault/services/VaultObservability';

export type { ObservabilitySpan };

const VACCINATION_OPS = {
  CREATE: 'vaccination.create',
  UPDATE: 'vaccination.update',
  VERIFY: 'vaccination.verify',
  ARCHIVE: 'vaccination.archive',
  RESTORE: 'vaccination.restore',
  GET_BY_PATIENT: 'vaccination.getByPatient',
  GET_HISTORY: 'vaccination.getHistory',
  GET_SCHEDULES: 'vaccination.getSchedules',
  GET_CERTIFICATES: 'vaccination.getCertificates',
  GENERATE_CERTIFICATE: 'vaccination.generateCertificate',
  GET_STATISTICS: 'vaccination.getStatistics',
  GET_TIMELINE: 'vaccination.getTimeline',
  CHECK_ELIGIBILITY: 'vaccination.checkEligibility',
  GET_BOOSTERS: 'vaccination.getBoosters',
  OFFLINE_SYNC: 'vaccination.offlineSync',
} as const;

export function startVaccinationSpan(operationName: string): ObservabilitySpan {
  return vaultObservability.startSpan(operationName);
}

export function recordVaccinationError(
  operationName: string,
  errorCode: string,
  meta?: Record<string, string | number | boolean>,
): void {
  vaultObservability.recordError(operationName, errorCode, meta);
}

export function incrementVaccinationMetric(
  metric: string,
  meta?: Record<string, string | number | boolean>,
): void {
  vaultObservability.increment(metric, meta);
}

export async function trackVaccinationOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  meta?: Record<string, string | number | boolean>,
): Promise<T> {
  const span = startVaccinationSpan(operationName);
  try {
    const result = await operation();
    span.end('success', meta);
    incrementVaccinationMetric(`${operationName}.success`, meta);
    return result;
  } catch (err: unknown) {
    const errorCode = err instanceof Error ? err.name : 'UnknownError';
    span.end('failure', { ...meta, errorCode });
    recordVaccinationError(operationName, errorCode, meta);
    incrementVaccinationMetric(`${operationName}.failure`, { ...meta, errorCode });
    throw err;
  }
}

export const VaccinationOp = VACCINATION_OPS;
