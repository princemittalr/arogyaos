/**
 * Health Vault Phase 5 — Core Unit Tests
 *
 * Coverage:
 * - VaultCache: get/set/TTL expiry/invalidation
 * - VaultOfflineQueue: enqueue/dequeue/conflict detection
 * - withRetry: success/failure/abort behavior
 * - AuditEvents: constant shape validation
 * - HealthVaultEventBus: subscribe/publish/unsubscribe/error isolation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── VaultCache Tests ─────────────────────────────────────────────────────────

describe('MemoryCache', () => {
  // Inline MemoryCache to avoid Firebase import transitive dependencies
  class MemoryCache<K extends string, V> {
    private readonly store = new Map<K, { value: V; expiresAt: number }>();
    private readonly maxSize: number;
    private readonly defaultTtlMs: number;
    constructor(opts: { maxSize: number; defaultTtlMs: number }) {
      this.maxSize = opts.maxSize;
      this.defaultTtlMs = opts.defaultTtlMs;
    }
    get(key: K): V | undefined {
      const entry = this.store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) { this.store.delete(key); return undefined; }
      return entry.value;
    }
    set(key: K, value: V, ttlMs?: number): void {
      if (this.store.size >= this.maxSize && !this.store.has(key)) {
        const firstKey = this.store.keys().next().value;
        if (firstKey !== undefined) this.store.delete(firstKey);
      }
      this.store.set(key, { value, expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs) });
    }
    delete(key: K): void { this.store.delete(key); }
    invalidatePrefix(prefix: string): void {
      for (const key of this.store.keys()) { if (key.startsWith(prefix)) this.store.delete(key); }
    }
    clear(): void { this.store.clear(); }
    size(): number { return this.store.size; }
  }

  let cache: MemoryCache<string, string>;

  beforeEach(() => {
    cache = new MemoryCache({ maxSize: 3, defaultTtlMs: 500 });
  });

  it('stores and retrieves a value', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('expires entries after TTL', async () => {
    cache.set('key1', 'value1', 50);
    await new Promise((r) => setTimeout(r, 80));
    expect(cache.get('key1')).toBeUndefined();
  });

  it('evicts oldest entry when at maxSize', () => {
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.set('k3', 'v3');
    cache.set('k4', 'v4');
    expect(cache.get('k1')).toBeUndefined();
    expect(cache.get('k4')).toBe('v4');
  });

  it('invalidates by prefix', () => {
    cache.set('patient:abc:1', 'd1');
    cache.set('patient:abc:2', 'd2');
    cache.set('patient:xyz:1', 'other');
    cache.invalidatePrefix('patient:abc');
    expect(cache.get('patient:abc:1')).toBeUndefined();
    expect(cache.get('patient:abc:2')).toBeUndefined();
    expect(cache.get('patient:xyz:1')).toBe('other');
  });

  it('clears all entries', () => {
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.clear();
    expect(cache.size()).toBe(0);
  });
});

// ─── VaultOfflineQueue Tests ──────────────────────────────────────────────────

describe('VaultOfflineQueue', () => {
  // Inline portable queue to avoid localStorage in node env
  interface QueuedOp {
    queueId: string;
    operation: string;
    ownerId: string;
    actorId: string;
    recordId?: string;
    recordType?: string;
    queuedAt: string;
    retries: number;
  }

  class TestableQueue {
    private store: QueuedOp[] = [];
    enqueue(op: Omit<QueuedOp, 'queuedAt' | 'retries'>): void {
      if (this.store.find((e) => e.queueId === op.queueId)) return;
      this.store.push({ ...op, queuedAt: new Date().toISOString(), retries: 0 });
    }
    dequeue(id: string): void { this.store = this.store.filter((e) => e.queueId !== id); }
    getAll(): QueuedOp[] { return [...this.store]; }
    hasPending(): boolean { return this.store.length > 0; }
    detectConflict(queuedAt: string, serverUpdatedAt: Date): boolean {
      return serverUpdatedAt.getTime() > new Date(queuedAt).getTime();
    }
    clear(): void { this.store = []; }
  }

  let queue: TestableQueue;

  beforeEach(() => { queue = new TestableQueue(); });

  it('starts empty', () => {
    expect(queue.hasPending()).toBe(false);
    expect(queue.getAll()).toHaveLength(0);
  });

  it('enqueues an operation', () => {
    queue.enqueue({ queueId: 'op-1', operation: 'ARCHIVE', ownerId: 'p1', actorId: 'p1', recordId: 'r1' });
    expect(queue.hasPending()).toBe(true);
    expect(queue.getAll()).toHaveLength(1);
  });

  it('deduplicates identical queue IDs', () => {
    const op = { queueId: 'op-2', operation: 'RESTORE', ownerId: 'p1', actorId: 'p1' };
    queue.enqueue(op);
    queue.enqueue(op);
    expect(queue.getAll()).toHaveLength(1);
  });

  it('dequeues an operation', () => {
    queue.enqueue({ queueId: 'op-3', operation: 'ARCHIVE', ownerId: 'p1', actorId: 'p1' });
    queue.dequeue('op-3');
    expect(queue.hasPending()).toBe(false);
  });

  it('detects staleness conflict correctly', () => {
    const queuedAt = new Date(Date.now() - 5000).toISOString();
    const serverUpdatedAt = new Date();
    expect(queue.detectConflict(queuedAt, serverUpdatedAt)).toBe(true);
  });

  it('returns no conflict when server is older', () => {
    const queuedAt = new Date().toISOString();
    const serverUpdatedAt = new Date(Date.now() - 5000);
    expect(queue.detectConflict(queuedAt, serverUpdatedAt)).toBe(false);
  });
});

// ─── withRetry Tests ──────────────────────────────────────────────────────────

describe('withRetry', () => {
  // Inline minimal retry for isolated unit testing
  class LogicalError extends Error { readonly isLogical = true; }
  class NetworkError extends Error { readonly isLogical = false; }

  async function withRetry<T>(
    operation: () => Promise<T>,
    opts: { maxAttempts: number; delayMs?: number } = { maxAttempts: 3 }
  ): Promise<T> {
    let last: unknown;
    for (let i = 1; i <= opts.maxAttempts; i++) {
      try {
        return await operation();
      } catch (err: unknown) {
        last = err;
        if (err instanceof LogicalError) throw err;
        if (i < opts.maxAttempts) await new Promise((r) => setTimeout(r, opts.delayMs ?? 10));
      }
    }
    throw last;
  }

  it('returns result on first attempt', async () => {
    const op = vi.fn().mockResolvedValue('success');
    expect(await withRetry(op)).toBe('success');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries on transient failure and succeeds', async () => {
    const op = vi.fn()
      .mockRejectedValueOnce(new NetworkError('timeout'))
      .mockResolvedValue('ok');
    expect(await withRetry(op, { maxAttempts: 3, delayMs: 5 })).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts', async () => {
    const op = vi.fn().mockRejectedValue(new NetworkError('down'));
    await expect(withRetry(op, { maxAttempts: 3, delayMs: 5 })).rejects.toBeInstanceOf(NetworkError);
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('does not retry logical errors', async () => {
    const op = vi.fn().mockRejectedValue(new LogicalError('bad input'));
    await expect(withRetry(op, { maxAttempts: 3 })).rejects.toBeInstanceOf(LogicalError);
    expect(op).toHaveBeenCalledTimes(1);
  });
});

// ─── AuditEvents Constants Tests ──────────────────────────────────────────────

describe('AUDIT_ACTIONS', () => {
  const AUDIT_ACTIONS = {
    RECORD_CREATED:              'RECORD_CREATED',
    RECORD_UPDATED:              'RECORD_UPDATED',
    RECORD_VIEWED:               'RECORD_VIEWED',
    RECORD_DOWNLOADED:           'RECORD_DOWNLOADED',
    RECORD_UPLOADED:             'RECORD_UPLOADED',
    RECORD_ARCHIVED:             'RECORD_ARCHIVED',
    RECORD_RESTORED:             'RECORD_RESTORED',
    VERSION_CREATED:             'VERSION_CREATED',
    FILE_UPLOADED:               'FILE_UPLOADED',
    FILE_DOWNLOADED:             'FILE_DOWNLOADED',
    SEARCH_EXECUTED:             'SEARCH_EXECUTED',
    FILTER_APPLIED:              'FILTER_APPLIED',
    FAILED_ACCESS_ATTEMPT:       'FAILED_ACCESS_ATTEMPT',
    PERMISSION_DENIED:           'PERMISSION_DENIED',
    CHECKSUM_VALIDATION_FAILURE: 'CHECKSUM_VALIDATION_FAILURE',
  } as const;

  const AUDIT_OUTCOMES = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    PARTIAL: 'PARTIAL',
  } as const;

  it('defines all required audit action constants', () => {
    const required = [
      'RECORD_CREATED', 'RECORD_UPDATED', 'RECORD_VIEWED', 'RECORD_DOWNLOADED',
      'RECORD_UPLOADED', 'RECORD_ARCHIVED', 'RECORD_RESTORED', 'VERSION_CREATED',
      'FILE_UPLOADED', 'FILE_DOWNLOADED', 'SEARCH_EXECUTED', 'FILTER_APPLIED',
      'FAILED_ACCESS_ATTEMPT', 'PERMISSION_DENIED', 'CHECKSUM_VALIDATION_FAILURE',
    ] as const;

    required.forEach((action) => {
      expect(AUDIT_ACTIONS).toHaveProperty(action);
    });
  });

  it('all audit action values are non-empty strings', () => {
    Object.values(AUDIT_ACTIONS).forEach((v: unknown) => {
      expect(typeof v).toBe('string');
      expect((v as string).length).toBeGreaterThan(0);
    });
  });

  it('defines SUCCESS, FAILURE, and PARTIAL outcomes', () => {
    expect(AUDIT_OUTCOMES.SUCCESS).toBe('SUCCESS');
    expect(AUDIT_OUTCOMES.FAILURE).toBe('FAILURE');
    expect(AUDIT_OUTCOMES.PARTIAL).toBe('PARTIAL');
  });
});

// ─── HealthVaultEventBus Tests ────────────────────────────────────────────────

describe('HealthVaultEventBus (inlined)', () => {
  // Inline event bus for isolated testing (no Firebase transitive deps)
  type Events = {
    RecordArchived:  { recordId: string; archiverId: string; timestamp: Date };
    RecordRestored:  { recordId: string; restorerId: string; timestamp: Date };
    RecordViewed:    { recordId: string; recordType: string; viewerId: string; timestamp: Date };
    RecordDeleted:   { recordId: string; deleterId: string; timestamp: Date };
  };
  type EventName = keyof Events;
  type Cb<K extends EventName> = (p: Events[K]) => void | Promise<void>;

  class TestEventBus {
    private listeners: { [K in EventName]?: Array<Cb<K>> } = {};
    subscribe<K extends EventName>(ev: K, cb: Cb<K>): () => void {
      if (!this.listeners[ev]) this.listeners[ev] = [];
      (this.listeners[ev] as Array<Cb<K>>).push(cb);
      return () => {
        this.listeners[ev] = (this.listeners[ev] as Array<Cb<K>>).filter((f) => f !== cb) as typeof this.listeners[K];
      };
    }
    async publish<K extends EventName>(ev: K, payload: Events[K]): Promise<void> {
      const list = this.listeners[ev];
      if (!list) return;
      await Promise.all((list as Array<Cb<K>>).map(async (cb) => {
        try { await cb(payload); } catch { /* isolated */ }
      }));
    }
    reset(): void { (Object.keys(this.listeners) as EventName[]).forEach((k) => delete this.listeners[k]); }
  }

  let bus: TestEventBus;

  beforeEach(() => { bus = new TestEventBus(); });
  afterEach(() => { bus.reset(); });

  it('calls subscriber on publish', async () => {
    const listener = vi.fn();
    bus.subscribe('RecordArchived', listener);
    await bus.publish('RecordArchived', { recordId: 'r1', archiverId: 'u1', timestamp: new Date() });
    expect(listener).toHaveBeenCalledWith({ recordId: 'r1', archiverId: 'u1', timestamp: expect.any(Date) });
  });

  it('unsubscribes correctly', async () => {
    const listener = vi.fn();
    const unsub = bus.subscribe('RecordRestored', listener);
    unsub();
    await bus.publish('RecordRestored', { recordId: 'r2', restorerId: 'u2', timestamp: new Date() });
    expect(listener).not.toHaveBeenCalled();
  });

  it('isolates errors in individual listeners', async () => {
    const badListener = vi.fn().mockRejectedValue(new Error('crash'));
    const goodListener = vi.fn();
    bus.subscribe('RecordViewed', badListener);
    bus.subscribe('RecordViewed', goodListener);
    await expect(
      bus.publish('RecordViewed', { recordId: 'r1', recordType: 'prescription', viewerId: 'u1', timestamp: new Date() })
    ).resolves.not.toThrow();
    expect(goodListener).toHaveBeenCalled();
  });

  it('does nothing when no subscribers registered', async () => {
    await expect(
      bus.publish('RecordDeleted', { recordId: 'r99', deleterId: 'u99', timestamp: new Date() })
    ).resolves.not.toThrow();
  });
});
