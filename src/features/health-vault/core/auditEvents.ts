/**
 * Health Vault — Audit Event Definitions
 *
 * Centralized, strongly typed constants for every auditable action.
 * These are the canonical strings stored in Firestore audit logs.
 * Never use raw string literals for audit actions anywhere in the codebase.
 */

export const AUDIT_ACTIONS = {
  // Record lifecycle
  RECORD_CREATED:              'RECORD_CREATED',
  RECORD_UPDATED:              'RECORD_UPDATED',
  RECORD_VIEWED:               'RECORD_VIEWED',
  RECORD_DOWNLOADED:           'RECORD_DOWNLOADED',
  RECORD_UPLOADED:             'RECORD_UPLOADED',
  RECORD_ARCHIVED:             'RECORD_ARCHIVED',
  RECORD_RESTORED:             'RECORD_RESTORED',

  // Version management
  VERSION_CREATED:             'VERSION_CREATED',

  // File operations
  FILE_UPLOADED:               'FILE_UPLOADED',
  FILE_DOWNLOADED:             'FILE_DOWNLOADED',
  FILE_PREVIEWED:              'FILE_PREVIEWED',
  BULK_DOWNLOAD:               'BULK_DOWNLOAD',

  // Metadata operations
  METADATA_UPDATED:            'METADATA_UPDATED',

  // Search and filter
  SEARCH_EXECUTED:             'SEARCH_EXECUTED',
  FILTER_APPLIED:              'FILTER_APPLIED',

  // Security events
  FAILED_ACCESS_ATTEMPT:       'FAILED_ACCESS_ATTEMPT',
  PERMISSION_DENIED:           'PERMISSION_DENIED',
  CHECKSUM_VALIDATION_FAILURE: 'CHECKSUM_VALIDATION_FAILURE',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

export const AUDIT_OUTCOMES = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  PARTIAL: 'PARTIAL',
} as const;

export type AuditOutcome = typeof AUDIT_OUTCOMES[keyof typeof AUDIT_OUTCOMES];

/**
 * Represents a single immutable audit log entry.
 * Never contains PHI — only metadata and identifiers.
 */
export interface AuditLogEntry {
  /** ULID — sortable, globally unique */
  auditId: string;

  /** The action performed */
  action: AuditAction;

  /** Outcome of the action */
  outcome: AuditOutcome;

  /** ISO-8601 timestamp — set server-side */
  timestamp: unknown; // Firestore serverTimestamp()

  /** ID of the patient who owns the record */
  ownerId: string;

  /** ID of the user who performed the action */
  actorId: string;

  /** Role of the actor (e.g. citizen, doctor, admin) */
  actorRole: string;

  /** The vault record ID affected (if applicable) */
  recordId?: string;

  /** The vault record type (e.g. prescription) */
  recordType?: string;

  /** The file ID affected (if applicable) */
  fileId?: string;

  /** The record version number at time of action */
  version?: number;

  /** Device context — never contains IP address */
  deviceId?: string;
  deviceType?: string;
  platform?: string;
  browser?: string;
  appVersion?: string;

  /** Failure detail for security/error events — MUST NOT contain PHI */
  failureReason?: string;

  /** Additional non-PHI metadata for structured querying */
  metadata?: Record<string, string | number | boolean>;
}
