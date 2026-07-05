'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications, useMarkNotificationReadMutation } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { motion } from 'framer-motion';

export default function CitizenNotificationsPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Local Filter state: 'all' | 'unread' | 'read'
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Queries & Mutations
  const { data: notifications, isLoading } = useNotifications(uid);
  const markReadMutation = useMarkNotificationReadMutation();

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  // Filter list
  const filteredNotifications = notifications?.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const handleMarkRead = async (id: string, read: boolean) => {
    if (read) return; // already read
    await markReadMutation.mutateAsync({
      notificationId: id,
      patientId: uid,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <PageHeader
        title="Notifications Inbox"
        description="Check status alerts, clinic OPD schedule updates, and system messages."
      />

      {/* Filter Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold select-none">
        {(['all', 'unread', 'read'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={cn(
              'pb-3.5 capitalize relative transition',
              filter === opt ? 'text-blue-650 dark:text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-850'
            )}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Notification items */}
      {filteredNotifications && filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id, notif.read)}
              className={cn(
                'rounded-2xl border p-5 flex gap-4 items-start transition cursor-pointer',
                notif.read
                  ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-75'
                  : 'bg-blue-50/20 border-blue-200/50 dark:bg-blue-950/10 dark:border-blue-900/40 ring-2 ring-blue-50/10'
              )}
            >
              <div
                className={cn(
                  'rounded-xl p-2.5 flex-shrink-0',
                  notif.read
                    ? 'bg-slate-50 text-slate-400 dark:bg-slate-955'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                )}
              >
                <icons.Bell className="h-5 w-5" />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-50">{notif.title}</h5>
                  <span className="text-[9.5px] font-bold text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0 self-center" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${filter} notifications`}
          description="We will notify you here when critical changes occur on your health record."
          icon={icons.Bell || icons.Home}
        />
      )}
    </motion.div>
  );
}
