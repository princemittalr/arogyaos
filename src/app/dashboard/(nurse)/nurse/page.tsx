'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import {
  Users, Bed, Activity, Pill, FileText, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

export default function NurseDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  // Realistic mock data for UI
  const assignedPatients = [
    { id: '1', name: 'Rohan Sharma', room: '101A', status: 'Stable', lastVitals: '1h ago', nextMed: 'In 30m' },
    { id: '2', name: 'Priya Patel', room: '102B', status: 'Critical', lastVitals: '10m ago', nextMed: 'Now' },
    { id: '3', name: 'Amit Kumar', room: '105A', status: 'Discharging', lastVitals: '4h ago', nextMed: 'Completed' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {t("nurse.good")} {today.getHours() < 12 ? 'morning' : 'afternoon'}, Nurse {user?.fullName?.split(' ').pop() || 'Workspace'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr} · Ward 3B</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Patients', value: '12', sub: '3 Discharging today', icon: Users, color: 'blue', href: '/dashboard/nurse/patients' },
          { label: 'Available Beds', value: '4', sub: 'Out of 24 total', icon: Bed, color: 'emerald', href: '/dashboard/nurse/beds' },
          { label: 'Pending Meds', value: '8', sub: 'Due in next hour', icon: Pill, color: 'amber', href: '/dashboard/nurse/medications' },
          { label: 'Emergency Alerts', value: '1', sub: 'Code blue protocol', icon: AlertTriangle, color: 'red', href: '/dashboard/nurse/emergency' }
        ].map((kpi, i) => {
          const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
            red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
          };
          const card = (
            <div className={cn('rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 transition-all hover:border-slate-300 hover:shadow-sm')}>
              <div className={cn('inline-flex rounded-lg p-2', colors[kpi.color])}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          );
          return <Link key={i} href={kpi.href}>{card}</Link>;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Assigned Patients</h2>
                <p className="text-xs text-slate-400 mt-0.5">Currently monitoring</p>
              </div>
              <Link href="/dashboard/nurse/patients" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignedPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {patient.room}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{patient.name}</p>
                      <p className="text-[11px] text-slate-400">Vitals: {patient.lastVitals} · Meds: {patient.nextMed}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 text-[10px] font-semibold rounded-md flex-shrink-0',
                    patient.status === 'Critical' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                    patient.status === 'Discharging' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                    'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                  )}>
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Log Vitals', icon: Activity, color: 'text-blue-600' },
                { label: 'Give Meds', icon: Pill, color: 'text-emerald-600' },
                { label: 'Add Note', icon: FileText, color: 'text-purple-600' },
                { label: 'Code Blue', icon: AlertTriangle, color: 'text-red-600' }
              ].map((item, i) => (
                <button key={i} className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <item.icon className={cn('h-5 w-5', item.color)} />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
