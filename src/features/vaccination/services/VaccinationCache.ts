import { MemoryCache } from '@/features/health-vault/services/VaultCache';
import { VaccinationRecord, VaccineCertificate, VaccinationTimelineEntry } from '../types';
import { VaccinationStatistics } from '../hooks/useVaccinationStatistics';

const PAGINATION_CACHE_TTL = 30_000;
const STATISTICS_CACHE_TTL = 60_000;
const TIMELINE_CACHE_TTL = 60_000;
const CERTIFICATE_CACHE_TTL = 120_000;

export const paginationCache = new MemoryCache<string, VaccinationRecord[]>({
  maxSize: 50,
  defaultTtlMs: PAGINATION_CACHE_TTL,
});

export const statisticsCache = new MemoryCache<string, VaccinationStatistics>({
  maxSize: 50,
  defaultTtlMs: STATISTICS_CACHE_TTL,
});

export const timelineCache = new MemoryCache<string, VaccinationTimelineEntry[]>({
  maxSize: 50,
  defaultTtlMs: TIMELINE_CACHE_TTL,
});

export const certificateCache = new MemoryCache<string, VaccineCertificate[]>({
  maxSize: 50,
  defaultTtlMs: CERTIFICATE_CACHE_TTL,
});

export function getCachedVaccinations(patientId: string, page: number, pageSize: number): VaccinationRecord[] | undefined {
  return paginationCache.get(`vaccinations:${patientId}:${page}:${pageSize}`);
}

export function setCachedVaccinations(patientId: string, page: number, pageSize: number, data: VaccinationRecord[]): void {
  paginationCache.set(`vaccinations:${patientId}:${page}:${pageSize}`, data);
}

export function getCachedStatistics(patientId: string): VaccinationStatistics | undefined {
  return statisticsCache.get(`stats:${patientId}`);
}

export function setCachedStatistics(patientId: string, data: VaccinationStatistics): void {
  statisticsCache.set(`stats:${patientId}`, data);
}

export function getCachedTimeline(patientId: string): VaccinationTimelineEntry[] | undefined {
  return timelineCache.get(`timeline:${patientId}`);
}

export function setCachedTimeline(patientId: string, data: VaccinationTimelineEntry[]): void {
  timelineCache.set(`timeline:${patientId}`, data);
}

export function getCachedCertificates(patientId: string): VaccineCertificate[] | undefined {
  return certificateCache.get(`certs:${patientId}`);
}

export function setCachedCertificates(patientId: string, data: VaccineCertificate[]): void {
  certificateCache.set(`certs:${patientId}`, data);
}

export function invalidateVaccinationCache(patientId: string): void {
  paginationCache.invalidatePrefix(`vaccinations:${patientId}`);
  statisticsCache.delete(`stats:${patientId}`);
  timelineCache.delete(`timeline:${patientId}`);
  certificateCache.delete(`certs:${patientId}`);
}

export function invalidateAllVaccinationCaches(): void {
  paginationCache.clear();
  statisticsCache.clear();
  timelineCache.clear();
  certificateCache.clear();
}
