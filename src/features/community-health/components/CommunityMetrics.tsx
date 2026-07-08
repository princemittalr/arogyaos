'use client';

import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCommunityDashboard } from '../hooks';
import { componentStyles } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { motion } from 'framer-motion';

export function CommunityMetrics({ workerId }: { workerId: string }) {
  const { t } = useLanguage();
  const { data: metrics, isLoading, isError } = useCommunityDashboard(workerId);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={componentStyles.card.base}>
            <div className="h-8 w-24 skeleton rounded mb-4" />
            <div className="h-12 w-16 skeleton rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className={componentStyles.emptyState.wrapper}>
        <icons.AlertTriangle className={componentStyles.emptyState.icon} />
        <h3 className={componentStyles.emptyState.title}>Failed to load metrics</h3>
        <p className={componentStyles.emptyState.description}>Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={componentStyles.card.base}>
        <h4 className="font-bold text-slate-700 dark:text-slate-300">Total Households</h4>
        <p className="text-4xl font-extrabold mt-3 text-slate-900 dark:text-white">{metrics.totalHouseholds}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={componentStyles.card.base}>
        <h4 className="font-bold text-slate-700 dark:text-slate-300">Upcoming Visits</h4>
        <p className="text-4xl font-extrabold mt-3 text-blue-600 dark:text-blue-400">{metrics.upcomingVisits}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={componentStyles.card.base}>
        <h4 className="font-bold text-slate-700 dark:text-slate-300">High Risk Pregnancies</h4>
        <p className="text-4xl font-extrabold mt-3 text-red-600 dark:text-red-400">{metrics.highRiskPregnancies}</p>
      </motion.div>
    </div>
  );
}
