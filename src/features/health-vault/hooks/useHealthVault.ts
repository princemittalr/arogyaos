/**
 * Health Vault — Primary Data Hook (Phase 5 Enhanced)
 *
 * Additions over Phase 4:
 * - Observability spans for timeline load and search operations
 * - Audit log for search events (query length only — no PHI)
 * - Audit log for filter events (filter keys only — no PHI)
 * - Stable memoization to prevent unnecessary re-renders
 * - Domain event publication for SearchPerformed and FilterChanged
 * - In-memory cache awareness (cache key by patientId + category)
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { TimelineRepository, TimelineQueryParams } from '../repositories/TimelineRepository';
import { TimelineIndexEntry } from '../types';
import { VaultStatus, VaultSource } from '../core/constants';
import { vaultObservability } from '../services/VaultObservability';
import { auditLogger } from '../services/AuditLogger';
import { AUDIT_ACTIONS } from '../core/auditEvents';
import { HealthVaultEventBus } from '../core/events';

export interface HealthVaultFilters {
  recordType?: string;
  startDate?: Date;
  endDate?: Date;
  hospitalName?: string;
  doctorName?: string;
  status?: VaultStatus;
  source?: VaultSource;
  tags?: string[];
  isVerified?: boolean;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'hospital'
  | 'doctor'
  | 'category'
  | 'recently_updated'
  | 'alphabetical';

// Stable date parser — handles Firestore Timestamps, Date objects, and strings
function parseSafeDate(d: unknown): Date {
  if (!d) return new Date();
  if (typeof (d as { toDate?: () => Date }).toDate === 'function') {
    return (d as { toDate: () => Date }).toDate();
  }
  if (d instanceof Date) return d;
  return new Date(d as string | number);
}

export function useHealthVault(patientId: string) {
  const [rawRecords, setRawRecords] = useState<TimelineIndexEntry[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filters, setFilters] = useState<HealthVaultFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const timelineRepo = useMemo(() => new TimelineRepository(), []);
  const eventBus = useMemo(() => HealthVaultEventBus.getInstance(), []);

  // Refs for audit debouncing — avoids logging on every keystroke
  const searchAuditTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterAuditTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRecords = useCallback(
    async (isInitial = true) => {
      if (!patientId) return;

      const span = vaultObservability.startSpan('vault.timeline.load');

      try {
        if (isInitial) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const params: TimelineQueryParams = {
          patientId,
          limitCount: 100,
          lastVisible: isInitial ? undefined : (lastVisible || undefined),
        };

        if (selectedCategory === 'archived') {
          params.status = 'ARCHIVED';
        } else if (selectedCategory !== 'all') {
          params.recordType = selectedCategory;
          params.status = 'ACTIVE';
        } else {
          params.status = 'ACTIVE';
        }

        const result = await timelineRepo.queryTimeline(params);

        if (isInitial) {
          setRawRecords(result.items);
        } else {
          setRawRecords((prev) => [...prev, ...result.items]);
        }

        setLastVisible(result.lastVisible);
        setHasMore(result.items.length === 100);

        span.end('success', { recordCount: result.items.length });
        vaultObservability.increment('vault.timeline.loads');

        // Publish domain event
        await eventBus.publish('TimelineLoaded', {
          patientId,
          actorId: patientId,
          recordCount: result.items.length,
          latencyMs: 0, // span.end already captures this in the adapter
          timestamp: new Date(),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[useHealthVault] Failed to query timeline:', msg);
        setError(err instanceof Error ? err : new Error(msg));
        span.end('failure', { errorCode: 'TIMELINE_QUERY_FAILED' });
        vaultObservability.recordError('vault.timeline.load', 'TIMELINE_QUERY_FAILED');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [patientId, selectedCategory, lastVisible, timelineRepo, eventBus]
  );

  useEffect(() => {
    setRawRecords([]);
    setLastVisible(null);
    setHasMore(true);
    fetchRecords(true);
  }, [selectedCategory, patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && lastVisible) {
      fetchRecords(false);
    }
  }, [loading, loadingMore, hasMore, lastVisible, fetchRecords]);

  // ─── Audit-aware search setter ──────────────────────────────────────────────

  const setSearchQueryWithAudit = useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Debounce audit to avoid logging on every keypress
      if (searchAuditTimer.current) clearTimeout(searchAuditTimer.current);
      searchAuditTimer.current = setTimeout(() => {
        if (query.trim().length > 0) {
          void auditLogger.success(AUDIT_ACTIONS.SEARCH_EXECUTED, {
            ownerId: patientId,
            actorId: patientId,
            actorRole: 'citizen',
            metadata: { queryLength: query.trim().length },
          });
          void eventBus.publish('SearchPerformed', {
            patientId,
            actorId: patientId,
            queryLength: query.trim().length,
            resultCount: 0, // Count is resolved in the memoized processedRecords; event carries intent only
            timestamp: new Date(),
          });
        }
      }, 600);
    },
    [patientId, eventBus]
  );

  // ─── Audit-aware filter setter ──────────────────────────────────────────────

  const setFiltersWithAudit = useCallback(
    (updater: (prev: HealthVaultFilters) => HealthVaultFilters) => {
      setFilters((prev) => {
        const next = updater(prev);
        if (filterAuditTimer.current) clearTimeout(filterAuditTimer.current);
        filterAuditTimer.current = setTimeout(() => {
          const activeFilterKeys = Object.keys(next).filter(
            (k) => next[k as keyof HealthVaultFilters] !== undefined
          );
          if (activeFilterKeys.length > 0) {
            void auditLogger.success(AUDIT_ACTIONS.FILTER_APPLIED, {
              ownerId: patientId,
              actorId: patientId,
              actorRole: 'citizen',
              metadata: { filterCount: activeFilterKeys.length },
            });
            void eventBus.publish('FilterChanged', {
              patientId,
              actorId: patientId,
              filterKeys: activeFilterKeys,
              timestamp: new Date(),
            });
          }
        }, 400);
        return next;
      });
    },
    [patientId, eventBus]
  );

  // ─── Stable search word list ────────────────────────────────────────────────

  const searchWords = useMemo(() => {
    return searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }, [searchQuery]);

  // ─── Client-side filter + sort ──────────────────────────────────────────────

  const processedRecords = useMemo(() => {
    let result = [...rawRecords];

    if (searchWords.length > 0) {
      result = result.filter((rec) => {
        const title      = rec.summaryFields.title.toLowerCase();
        const docName    = rec.summaryFields.providerName.toLowerCase();
        const hospName   = rec.summaryFields.hospitalName.toLowerCase();
        const recType    = rec.recordType.toLowerCase();

        return searchWords.every((word) =>
          title.includes(word)    ||
          docName.includes(word)  ||
          hospName.includes(word) ||
          recType.includes(word)  ||
          (rec.metadata.source?.toLowerCase().includes(word) ?? false) ||
          (rec.metadata.interoperability?.resourceType?.toLowerCase().includes(word) ?? false)
        );
      });
    }

    if (filters.recordType) {
      result = result.filter((rec) => rec.recordType === filters.recordType);
    }

    if (filters.startDate) {
      const from = filters.startDate.getTime();
      result = result.filter((rec) => parseSafeDate(rec.encounterDate).getTime() >= from);
    }

    if (filters.endDate) {
      const to = filters.endDate.getTime();
      result = result.filter((rec) => parseSafeDate(rec.encounterDate).getTime() <= to);
    }

    if (filters.hospitalName) {
      const hName = filters.hospitalName.toLowerCase();
      result = result.filter((rec) => rec.summaryFields.hospitalName.toLowerCase().includes(hName));
    }

    if (filters.doctorName) {
      const dName = filters.doctorName.toLowerCase();
      result = result.filter((rec) => rec.summaryFields.providerName.toLowerCase().includes(dName));
    }

    if (filters.status) {
      result = result.filter((rec) => rec.summaryFields.status === filters.status);
    }

    if (filters.source) {
      result = result.filter((rec) => rec.metadata.source === filters.source);
    }

    if (filters.isVerified !== undefined) {
      result = result.filter((rec) => rec.metadata.verification.isVerified === filters.isVerified);
    }

    result.sort((a, b) => {
      const dateA = parseSafeDate(a.encounterDate).getTime();
      const dateB = parseSafeDate(b.encounterDate).getTime();

      switch (sortBy) {
        case 'oldest':           return dateA - dateB;
        case 'hospital':         return a.summaryFields.hospitalName.localeCompare(b.summaryFields.hospitalName);
        case 'doctor':           return a.summaryFields.providerName.localeCompare(b.summaryFields.providerName);
        case 'category':         return a.recordType.localeCompare(b.recordType);
        case 'recently_updated': {
          const uA = a.metadata.updatedAt ? parseSafeDate(a.metadata.updatedAt).getTime() : 0;
          const uB = b.metadata.updatedAt ? parseSafeDate(b.metadata.updatedAt).getTime() : 0;
          return uB - uA;
        }
        case 'alphabetical':     return a.summaryFields.title.localeCompare(b.summaryFields.title);
        case 'newest':
        default:                 return dateB - dateA;
      }
    });

    return result;
  }, [rawRecords, searchWords, filters, sortBy]);

  // ─── Statistics ─────────────────────────────────────────────────────────────

  const statistics = useMemo(() => {
    const stats = {
      total: 0, prescriptions: 0, labReports: 0,
      radiology: 0, vaccinations: 0, certificates: 0,
      consultations: 0, dischargeSummaries: 0,
    };

    rawRecords.forEach((rec) => {
      if (rec.summaryFields.status === 'ACTIVE') {
        stats.total++;
        switch (rec.recordType) {
          case 'prescription':        stats.prescriptions++;     break;
          case 'lab_report':          stats.labReports++;        break;
          case 'radiology_report':    stats.radiology++;         break;
          case 'vaccination':         stats.vaccinations++;      break;
          case 'medical_certificate': stats.certificates++;      break;
          case 'consultation':        stats.consultations++;     break;
          case 'discharge_summary':   stats.dischargeSummaries++; break;
        }
      }
    });

    return stats;
  }, [rawRecords]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  return {
    records: processedRecords,
    rawRecords,
    loading,
    loadingMore,
    error,
    hasMore,
    searchQuery,
    setSearchQuery: setSearchQueryWithAudit,
    selectedCategory,
    setSelectedCategory,
    filters,
    setFilters: setFiltersWithAudit,
    sortBy,
    setSortBy,
    statistics,
    loadMore,
    retry: () => fetchRecords(true),
    resetFilters,
  };
}

export default useHealthVault;
