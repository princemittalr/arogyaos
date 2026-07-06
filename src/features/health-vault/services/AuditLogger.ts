/**
 * Health Vault — Audit Logger Service
 *
 * Provides a single, centralized, append-only audit log pipeline.
 *
 * Design constraints:
 * - Entries are NEVER modified or deleted after creation
 * - Entries NEVER contain PHI (patient name, diagnosis, medication, etc.)
 * - Entries NEVER contain IP addresses
 * - All writes are idempotent via ULID-based document IDs
 * - Failures are isolated — audit log errors MUST NOT block primary operations
 */

import { db } from '@/firebase/client';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ulid } from '../utils/ulid';
import { AuditAction, AuditOutcome, AuditLogEntry, AUDIT_OUTCOMES } from '../core/auditEvents';

const AUDIT_COLLECTION = 'health_vault_audit_log';

export interface AuditContext {
  ownerId: string;
  actorId: string;
  actorRole: string;
  recordId?: string;
  recordType?: string;
  fileId?: string;
  version?: number;
  deviceId?: string;
  deviceType?: string;
  platform?: string;
  browser?: string;
  appVersion?: string;
  failureReason?: string;
  metadata?: Record<string, string | number | boolean>;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Writes an immutable audit log entry to Firestore.
   * Errors are isolated — a logging failure MUST NOT throw to the caller.
   */
  public async log(
    action: AuditAction,
    outcome: AuditOutcome,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditId = ulid();

      const entry: Omit<AuditLogEntry, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> } = {
        auditId,
        action,
        outcome,
        timestamp: serverTimestamp(),
        ownerId: context.ownerId,
        actorId: context.actorId,
        actorRole: context.actorRole,
        ...(context.recordId  && { recordId:   context.recordId }),
        ...(context.recordType && { recordType: context.recordType }),
        ...(context.fileId    && { fileId:     context.fileId }),
        ...(context.version   !== undefined && { version: context.version }),
        ...(context.deviceId  && { deviceId:   context.deviceId }),
        ...(context.deviceType && { deviceType: context.deviceType }),
        ...(context.platform  && { platform:   context.platform }),
        ...(context.browser   && { browser:    context.browser }),
        ...(context.appVersion && { appVersion: context.appVersion }),
        ...(context.failureReason && { failureReason: context.failureReason }),
        ...(context.metadata  && { metadata:   context.metadata }),
      };

      const auditRef = doc(collection(db, AUDIT_COLLECTION), auditId);
      await setDoc(auditRef, entry);
    } catch (err: unknown) {
      // Audit failures are isolated — they MUST NOT propagate to callers
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AuditLogger] Failed to write audit entry.', {
        action,
        outcome,
        ownerId: context.ownerId,
        error: msg,
      });
    }
  }

  /** Convenience: log a successful action */
  public async success(action: AuditAction, context: AuditContext): Promise<void> {
    return this.log(action, AUDIT_OUTCOMES.SUCCESS, context);
  }

  /** Convenience: log a failed action */
  public async failure(action: AuditAction, context: AuditContext, reason: string): Promise<void> {
    return this.log(action, AUDIT_OUTCOMES.FAILURE, {
      ...context,
      failureReason: reason,
    });
  }
}

/** Module-level singleton accessor */
export const auditLogger = AuditLogger.getInstance();
