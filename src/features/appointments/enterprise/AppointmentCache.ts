import { MemoryCache } from '@/features/health-vault/services/VaultCache';
import type { CalendarEvent, AppointmentAvailability, WaitingListEntry } from '../types';
import type { AppointmentStatistics } from '../hooks/useAppointmentStatistics';
import type { FollowUpSummary } from '../hooks/useFollowUps';

export const appointmentListCache = new MemoryCache<string, unknown>({
  maxSize: 100,
  defaultTtlMs: 30_000,
});

export const calendarCache = new MemoryCache<string, CalendarEvent[]>({
  maxSize: 50,
  defaultTtlMs: 30_000,
});

export const availabilityCache = new MemoryCache<string, AppointmentAvailability[]>({
  maxSize: 50,
  defaultTtlMs: 60_000,
});

export const waitingListCache = new MemoryCache<string, WaitingListEntry[]>({
  maxSize: 50,
  defaultTtlMs: 30_000,
});

export const statisticsCache = new MemoryCache<string, AppointmentStatistics>({
  maxSize: 50,
  defaultTtlMs: 60_000,
});

export const followUpCache = new MemoryCache<string, FollowUpSummary>({
  maxSize: 50,
  defaultTtlMs: 30_000,
});

export function invalidateAppointmentCaches(patientId?: string): void {
  if (patientId) {
    appointmentListCache.invalidatePrefix(patientId);
    calendarCache.invalidatePrefix(patientId);
    statisticsCache.invalidatePrefix(patientId);
    followUpCache.invalidatePrefix(patientId);
  } else {
    appointmentListCache.clear();
    calendarCache.clear();
    availabilityCache.clear();
    waitingListCache.clear();
    statisticsCache.clear();
    followUpCache.clear();
  }
}
