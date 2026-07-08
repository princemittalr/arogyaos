'use client';

import React, { useState, useEffect } from 'react';
import { icons } from '@/design-system/icons';
import { offlineQueue } from '../core/offline';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineSyncBanner() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check initial network state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling for queue length (in a real app, use an event emitter or store subscription)
    const interval = setInterval(() => {
      setPendingCount(offlineQueue.getPendingCount());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await offlineQueue.sync();
      setPendingCount(0);
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {(pendingCount > 0 || !isOnline) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`flex items-center justify-between px-4 py-3 rounded-xl mb-6 ${
            !isOnline 
              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' 
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {!isOnline ? <icons.AlertTriangle className="h-5 w-5" /> : <icons.UploadCloud className="h-5 w-5" />}
            <span className="text-sm font-semibold">
              {!isOnline 
                ? 'You are currently offline. Operations will be queued locally.' 
                : `${pendingCount} offline operation(s) pending synchronization.`}
            </span>
          </div>
          {isOnline && pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSyncing && <icons.RefreshCw className="h-3 w-3 animate-spin" />}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
