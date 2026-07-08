'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/features/shared';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import { CommunityMetrics } from '@/features/community-health/components/CommunityMetrics';
import { OfflineSyncBanner } from '@/features/community-health/components/OfflineSyncBanner';
import { componentStyles } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { motion } from 'framer-motion';
import { useScheduleVisit, useEmergencyReferral } from '@/features/community-health/hooks';
import { toast } from 'sonner';

export default function AshaWorkerDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const workerId = user?.uid || 'worker-1';

  const scheduleVisit = useScheduleVisit();
  const escalateEmergency = useEmergencyReferral();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [householdId, setHouseholdId] = useState('');

  const handleSchedule = async () => {
    if (!householdId) {
      toast.error('Please enter a Household ID');
      return;
    }
    try {
      await scheduleVisit.mutateAsync({
        householdId,
        workerId,
        date: new Date().toISOString(),
        outcome: 'pending',
        type: 'routine'
      });
      toast.success('Visit scheduled (queued for offline sync)');
      setIsDrawerOpen(false);
      setHouseholdId('');
    } catch (e) {
      toast.error('Failed to schedule visit');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title={t("asha.dashboard", "Community Health Dashboard")}
        description={`Welcome back, ${user?.fullName || 'ASHA Worker'}. View your assigned families, pending visits, and community health alerts.`}
      />

      <OfflineSyncBanner />

      <CommunityMetrics workerId={workerId} />

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={componentStyles.card.base}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Today&apos;s Visits</h3>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className={componentStyles.button.base + ' ' + componentStyles.button.primary + ' px-4 py-2 text-xs'}
              >
                <icons.Plus className="h-4 w-4 mr-2" />
                Schedule Visit
              </button>
            </div>
            
            <div className={componentStyles.emptyState.wrapper}>
              <icons.Calendar className={componentStyles.emptyState.icon} />
              <h3 className={componentStyles.emptyState.title}>No active visits today</h3>
              <p className={componentStyles.emptyState.description}>
                You have completed all scheduled household visits for your assigned area today.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={componentStyles.card.base}>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <icons.Users className="h-5 w-5 text-indigo-500" />
                  Maternal Care
                </div>
                <icons.ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <icons.Activity className="h-5 w-5 text-emerald-500" />
                  Child Health (Immunizations)
                </div>
                <icons.ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <icons.Pill className="h-5 w-5 text-amber-500" />
                  Chronic Disease Follow-up
                </div>
                <icons.ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              
              <button 
                onClick={() => escalateEmergency.mutate({ memberId: 'N/A', reason: 'Emergency', facilityId: 'district_1' })}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-red-700 dark:text-red-400">
                  <icons.AlertTriangle className="h-5 w-5" />
                  Emergency Referral
                </div>
                <icons.ChevronRight className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold">Schedule Household Visit</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Household ID</label>
              <input 
                type="text"
                value={householdId}
                onChange={(e) => setHouseholdId(e.target.value)}
                placeholder="Enter ID"
                className={componentStyles.input.base + ' mt-1'} 
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsDrawerOpen(false)} className={componentStyles.button.base + ' px-4 py-2 text-sm text-slate-500'}>Cancel</button>
              <button onClick={handleSchedule} disabled={scheduleVisit.isPending} className={componentStyles.button.base + ' ' + componentStyles.button.primary + ' px-4 py-2 text-sm'}>
                {scheduleVisit.isPending ? 'Scheduling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
