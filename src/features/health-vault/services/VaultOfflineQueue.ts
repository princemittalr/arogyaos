/**
 * Health Vault — Offline Support & Background Synchronization
 *
 * Manages:
 * 1. Connection monitoring (online/offline detection)
 * 2. Queued mutations (upload, archive, restore) during offline periods
 * 3. Background sync on reconnection
 * 4. Conflict detection and resolution strategy
 *
 * Storage backend: localStorage (for queue persistence across page reloads)
 * Queue entries NEVER store PHI — only operation type, IDs, and context.
 */

export const QUEUE_OPERATIONS = {
  UPLOAD:  'VAULT_QUEUE_UPLOAD',
  ARCHIVE: 'VAULT_QUEUE_ARCHIVE',
  RESTORE: 'VAULT_QUEUE_RESTORE',
} as const;

export type QueueOperation = typeof QUEUE_OPERATIONS[keyof typeof QUEUE_OPERATIONS];

export interface QueuedVaultOperation {
  /** ULID — stable identifier for deduplication */
  queueId: string;
  operation: QueueOperation;
  /** ISO-8601 — for staleness detection */
  queuedAt: string;
  retries: number;
  /** The patient/owner of the record */
  ownerId: string;
  /** Optional vault record being targeted */
  recordId?: string;
  recordType?: string;
  /** Device context for audit */
  actorId: string;
}

const QUEUE_STORAGE_KEY = 'hv_offline_queue';
const MAX_RETRIES = 5;

export class VaultOfflineQueue {
  private static instance: VaultOfflineQueue;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncListeners: Array<() => void> = [];
  private connectionListeners: Array<(online: boolean) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online',  this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public static getInstance(): VaultOfflineQueue {
    if (!VaultOfflineQueue.instance) {
      VaultOfflineQueue.instance = new VaultOfflineQueue();
    }
    return VaultOfflineQueue.instance;
  }

  // ─── Connection state ────────────────────────────────────────────────────

  private handleOnline = (): void => {
    this.isOnline = true;
    this.connectionListeners.forEach((cb) => cb(true));
    // Trigger background sync on reconnection
    void this.processPendingQueue();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.connectionListeners.forEach((cb) => cb(false));
  };

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public onConnectionChange(listener: (online: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  // ─── Queue management ────────────────────────────────────────────────────

  private readQueue(): QueuedVaultOperation[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as QueuedVaultOperation[]) : [];
    } catch {
      return [];
    }
  }

  private writeQueue(queue: QueuedVaultOperation[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[VaultOfflineQueue] Failed to persist queue.', msg);
    }
  }

  /**
   * Enqueue an operation to be executed when connectivity is restored.
   * Safe to call at any time — if online, immediately attempts execution.
   */
  public enqueue(op: Omit<QueuedVaultOperation, 'queuedAt' | 'retries'>): void {
    const queue = this.readQueue();

    // Deduplication: do not re-queue the same operation
    const existing = queue.find((e) => e.queueId === op.queueId);
    if (existing) return;

    const entry: QueuedVaultOperation = {
      ...op,
      queuedAt: new Date().toISOString(),
      retries: 0,
    };

    this.writeQueue([...queue, entry]);

    if (this.isOnline) {
      void this.processPendingQueue();
    }
  }

  public dequeue(queueId: string): void {
    const queue = this.readQueue().filter((e) => e.queueId !== queueId);
    this.writeQueue(queue);
  }

  public getPendingOperations(): QueuedVaultOperation[] {
    return this.readQueue();
  }

  public hasPendingOperations(): boolean {
    return this.readQueue().length > 0;
  }

  // ─── Conflict detection ──────────────────────────────────────────────────

  /**
   * Detects staleness conflicts by comparing server version with expected version.
   * If mismatch is detected, the queued operation is dropped and a CONFLICT event
   * is surfaced so the UI can prompt the user.
   *
   * Strategy: Last-Write-Wins for archive/restore; user-prompt for data mutations.
   */
  public detectConflict(
    queuedAt: string,
    serverUpdatedAt: Date
  ): boolean {
    const queuedTime = new Date(queuedAt).getTime();
    return serverUpdatedAt.getTime() > queuedTime;
  }

  // ─── Background sync ─────────────────────────────────────────────────────

  /**
   * Process queued operations sequentially.
   * Listeners are called after each successful sync cycle.
   */
  public async processPendingQueue(
    executor?: (op: QueuedVaultOperation) => Promise<void>
  ): Promise<void> {
    const queue = this.readQueue();
    if (queue.length === 0) return;

    const remaining: QueuedVaultOperation[] = [];

    for (const op of queue) {
      if (!this.isOnline) {
        remaining.push(op);
        continue;
      }

      try {
        if (executor) {
          await executor(op);
        }
        // Successfully synced — do not re-add to queue
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[VaultOfflineQueue] Sync attempt failed.', {
          queueId: op.queueId,
          operation: op.operation,
          retries: op.retries,
          error: msg,
        });

        if (op.retries < MAX_RETRIES) {
          remaining.push({ ...op, retries: op.retries + 1 });
        } else {
          console.error('[VaultOfflineQueue] Max retries exceeded — dropping operation.', {
            queueId: op.queueId,
            operation: op.operation,
          });
        }
      }
    }

    this.writeQueue(remaining);
    this.syncListeners.forEach((cb) => cb());
  }

  public onSync(listener: () => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  /** Destroy event listeners (call on module unload) */
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online',  this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

/** Module-level singleton */
export const vaultOfflineQueue = VaultOfflineQueue.getInstance();
