/**
 * Health Vault — Domain Events
 *
 * Centralized, strongly typed event contracts for all vault domain events.
 * No raw string literals are used anywhere in the codebase for event names.
 *
 * Event naming convention: PascalCase noun + past-tense verb.
 * All event payloads are read-only to enforce immutability.
 */

import { TimelineIndexEntry } from '../types';

// ─── Event Payload Contracts ──────────────────────────────────────────────────

export interface RecordCreatedPayload {
  readonly indexEntry: TimelineIndexEntry;
  readonly creatorId: string;
  readonly timestamp: Date;
}

export interface RecordUpdatedPayload {
  readonly indexEntry: TimelineIndexEntry;
  readonly updaterId: string;
  readonly timestamp: Date;
}

/** Logical delete only — no physical document is ever removed */
export interface RecordDeletedPayload {
  readonly recordId: string;
  readonly deleterId: string;
  readonly timestamp: Date;
}

export interface RecordArchivedPayload {
  readonly recordId: string;
  readonly archiverId: string;
  readonly timestamp: Date;
}

export interface RecordRestoredPayload {
  readonly recordId: string;
  readonly restorerId: string;
  readonly timestamp: Date;
}

export interface RecordViewedPayload {
  readonly recordId: string;
  readonly recordType: string;
  readonly viewerId: string;
  readonly timestamp: Date;
}

export interface RecordDownloadedPayload {
  readonly recordId: string;
  readonly fileId: string;
  readonly downloaderId: string;
  readonly timestamp: Date;
}

export interface RecordUploadedPayload {
  readonly recordId: string;
  readonly fileId: string;
  readonly uploaderId: string;
  readonly timestamp: Date;
}

export interface VersionCreatedPayload {
  readonly recordId: string;
  readonly version: number;
  readonly creatorId: string;
  readonly timestamp: Date;
}

export interface SearchPerformedPayload {
  readonly patientId: string;
  readonly actorId: string;
  /** Term length only — never the actual search query (could contain PHI) */
  readonly queryLength: number;
  readonly resultCount: number;
  readonly timestamp: Date;
}

export interface FilterChangedPayload {
  readonly patientId: string;
  readonly actorId: string;
  /** List of filter keys applied — never the filter values */
  readonly filterKeys: string[];
  readonly timestamp: Date;
}

export interface TimelineLoadedPayload {
  readonly patientId: string;
  readonly actorId: string;
  readonly recordCount: number;
  readonly latencyMs: number;
  readonly timestamp: Date;
}

export interface UploadCompletedPayload {
  readonly recordId: string;
  readonly fileId: string;
  readonly uploaderId: string;
  readonly fileSizeBytes: number;
  readonly durationMs: number;
  readonly timestamp: Date;
}

export interface DownloadCompletedPayload {
  readonly recordId: string;
  readonly fileId: string;
  readonly downloaderId: string;
  readonly fileSizeBytes: number;
  readonly durationMs: number;
  readonly timestamp: Date;
}

// ─── Event Map ────────────────────────────────────────────────────────────────

export interface HealthVaultEvents {
  RecordCreated:      RecordCreatedPayload;
  RecordUpdated:      RecordUpdatedPayload;
  RecordDeleted:      RecordDeletedPayload;
  RecordArchived:     RecordArchivedPayload;
  RecordRestored:     RecordRestoredPayload;
  RecordViewed:       RecordViewedPayload;
  RecordDownloaded:   RecordDownloadedPayload;
  RecordUploaded:     RecordUploadedPayload;
  VersionCreated:     VersionCreatedPayload;
  SearchPerformed:    SearchPerformedPayload;
  FilterChanged:      FilterChangedPayload;
  TimelineLoaded:     TimelineLoadedPayload;
  UploadCompleted:    UploadCompletedPayload;
  DownloadCompleted:  DownloadCompletedPayload;
  // Legacy aliases kept for backward compatibility
  RecordVersionCreated: VersionCreatedPayload;
}

export type HealthVaultEventName = keyof HealthVaultEvents;

// ─── Event Bus ────────────────────────────────────────────────────────────────

type EventCallback<K extends HealthVaultEventName> = (
  payload: HealthVaultEvents[K]
) => void | Promise<void>;

/**
 * Type-safe in-process event bus for Health Vault domain events.
 * Singleton — one instance per JS runtime.
 */
export class HealthVaultEventBus {
  private static instance: HealthVaultEventBus;
  private readonly listeners: {
    [K in HealthVaultEventName]?: Array<EventCallback<K>>;
  } = {};

  private constructor() {}

  public static getInstance(): HealthVaultEventBus {
    if (!HealthVaultEventBus.instance) {
      HealthVaultEventBus.instance = new HealthVaultEventBus();
    }
    return HealthVaultEventBus.instance;
  }

  /**
   * Subscribe to a domain event. Returns an unsubscribe function.
   */
  public subscribe<K extends HealthVaultEventName>(
    event: K,
    callback: EventCallback<K>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    (this.listeners[event] as Array<EventCallback<K>>).push(callback);

    return () => {
      const list = this.listeners[event] as Array<EventCallback<K>> | undefined;
      if (list) {
        this.listeners[event] = list.filter(
          (cb) => cb !== callback
        ) as typeof this.listeners[K];
      }
    };
  }

  /**
   * Publish a domain event. All listener errors are isolated.
   */
  public async publish<K extends HealthVaultEventName>(
    event: K,
    payload: HealthVaultEvents[K]
  ): Promise<void> {
    const list = this.listeners[event];
    if (!list || list.length === 0) return;

    await Promise.all(
      (list as Array<EventCallback<K>>).map(async (callback) => {
        try {
          await callback(payload);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            `[HealthVaultEventBus] Listener error for event "${event}":`,
            msg
          );
        }
      })
    );
  }

  /** Remove all listeners (primarily for testing teardown) */
  public reset(): void {
    (Object.keys(this.listeners) as HealthVaultEventName[]).forEach((key) => {
      delete this.listeners[key];
    });
  }
}
