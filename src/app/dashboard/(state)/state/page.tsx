'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React from 'react';
import { motion } from 'framer-motion';
import { Map, Shield, Building, Package } from 'lucide-react';

export default function StateDashboardPage() {
  const { t } = useLanguage();
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">State Command Center</h1>
        <p className="text-sm text-slate-500 mt-0.5">{todayStr} · Health Analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Districts Monitored', value: '38', icon: Map, color: 'blue' },
          { label: 'Active Facilities', value: '1,245', icon: Building, color: 'emerald' },
          { label: 'Supply Chain Alerts', value: '12', icon: Package, color: 'amber' },
          { label: 'Policy Updates', value: '3', icon: Shield, color: 'purple' }
        ].map((kpi, i) => {
          const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
          };
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
              <div className={`inline-flex rounded-lg p-2 ${colors[kpi.color]}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
