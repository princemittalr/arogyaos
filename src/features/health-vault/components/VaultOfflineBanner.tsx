'use client';

/**
 * Vault Offline Banner
 *
 * WCAG 2.2 AA compliant offline/sync status indicator.
 * Uses aria-live="assertive" for critical offline notifications
 * and aria-live="polite" for sync completion announcements.
 */

import React from 'react';
import { useVaultOffline } from '../hooks/useVaultOffline';

export function VaultOfflineBanner() {
  const { isOnline, hasPending, pendingOperations, triggerSync, statusAnnouncement } =
    useVaultOffline();

  if (isOnline && !hasPending) return null;

  return (
    <>
      {/* Screen reader live region — critical offline state */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {statusAnnouncement}
      </div>

      {/* Visual banner */}
      <div
        role="alert"
        aria-label={isOnline ? 'Sync status' : 'Offline mode active'}
        className={[
          'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition-all',
          isOnline
            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300',
        ].join(' ')}
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={[
              'h-2 w-2 rounded-full',
              isOnline ? 'bg-amber-500' : 'bg-red-500 animate-pulse',
            ].join(' ')}
          />
          {isOnline
            ? `Syncing ${pendingOperations.length} queued operation${pendingOperations.length !== 1 ? 's' : ''}…`
            : `Offline — ${hasPending ? `${pendingOperations.length} operation${pendingOperations.length !== 1 ? 's' : ''} queued` : 'read-only mode'}`}
        </span>

        {isOnline && hasPending && (
          <button
            onClick={triggerSync}
            className="rounded-lg bg-amber-100 px-2.5 py-1 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50 transition"
            aria-label="Retry synchronization"
          >
            Sync now
          </button>
        )}
      </div>
    </>
  );
}

export default VaultOfflineBanner;
