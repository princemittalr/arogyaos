/**
 * Health Vault — In-Memory LRU Cache
 *
 * Provides a fast, bounded, TTL-aware cache for metadata and timeline entries.
 * Prevents redundant Firestore reads within a single page session.
 *
 * Cache rules:
 * - Timeline index entries: TTL 60s
 * - Record detail fetch: TTL 30s
 * - File metadata: TTL 120s
 * - Invalidated immediately on any write (create / update / archive / restore)
 * - All cache misses fall through to Firestore transparently
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
}

export class MemoryCache<K extends string, V> {
  private readonly store = new Map<K, CacheEntry<V>>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;

  constructor(options: { maxSize: number; defaultTtlMs: number }) {
    this.maxSize = options.maxSize;
    this.defaultTtlMs = options.defaultTtlMs;
  }

  public get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  public set(key: K, value: V, ttlMs?: number): void {
    // Evict oldest entry if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) {
        this.store.delete(firstKey);
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  public delete(key: K): void {
    this.store.delete(key);
  }

  public invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  public clear(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }
}

// ─── Shared Vault Cache Instances ─────────────────────────────────────────────

/** Timeline index entries — keyed by `{patientId}:{category}:{page}` */
export const timelineCache = new MemoryCache<string, unknown>({
  maxSize: 200,
  defaultTtlMs: 60_000, // 60 seconds
});

/** Record detail fetches — keyed by `{recordType}:{recordId}` */
export const recordDetailCache = new MemoryCache<string, unknown>({
  maxSize: 100,
  defaultTtlMs: 30_000, // 30 seconds
});

/** File metadata — keyed by `{recordId}` */
export const fileMetaCache = new MemoryCache<string, unknown>({
  maxSize: 100,
  defaultTtlMs: 120_000, // 120 seconds
});

/**
 * Invalidate all caches for a specific record after any mutation.
 * Must be called after create / update / archive / restore operations.
 */
export function invalidateRecordCache(recordId: string, patientId: string): void {
  recordDetailCache.invalidatePrefix(recordId);
  fileMetaCache.delete(recordId);
  timelineCache.invalidatePrefix(patientId);
}
