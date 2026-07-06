/**
 * Health Vault — Offline Status Hook
 *
 * Provides:
 * 1. Real-time connection status (online/offline)
 * 2. Pending offline operation count
 * 3. Background sync trigger
 *
 * WCAG 2.2 AA compliant: aria-live region updates are surfaced via returned values
 * for the UI layer to render accessible status announcements.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { vaultOfflineQueue, QueuedVaultOperation } from '../services/VaultOfflineQueue';

export interface UseVaultOfflineReturn {
  /** True when the browser has an active network connection */
  isOnline: boolean;
  /** Operations queued while offline */
  pendingOperations: QueuedVaultOperation[];
  /** True if there are unsynced operations */
  hasPending: boolean;
  /** Manually trigger a sync attempt (useful for "Retry" buttons) */
  triggerSync: () => void;
  /** Accessible status string for aria-live announcements */
  statusAnnouncement: string;
}

export function useVaultOffline(): UseVaultOfflineReturn {
  const [isOnline, setIsOnline] = useState(() => vaultOfflineQueue.getConnectionStatus());
  const [pendingOperations, setPendingOperations] = useState<QueuedVaultOperation[]>(
    () => vaultOfflineQueue.getPendingOperations()
  );
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  useEffect(() => {
    const unsubConn = vaultOfflineQueue.onConnectionChange((online) => {
      setIsOnline(online);
      setStatusAnnouncement(
        online
          ? 'Connection restored. Synchronizing queued health vault operations.'
          : 'You are offline. Changes will be saved and synced when connection is restored.'
      );
    });

    const unsubSync = vaultOfflineQueue.onSync(() => {
      setPendingOperations(vaultOfflineQueue.getPendingOperations());
      setStatusAnnouncement('Health vault synchronization complete.');
    });

    return () => {
      unsubConn();
      unsubSync();
    };
  }, []);

  const triggerSync = useCallback(() => {
    void vaultOfflineQueue.processPendingQueue();
  }, []);

  return {
    isOnline,
    pendingOperations,
    hasPending: pendingOperations.length > 0,
    triggerSync,
    statusAnnouncement,
  };
}
