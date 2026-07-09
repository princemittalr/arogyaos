'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { LoadingState } from '@/features/shared';
import { useLaboratoryModuleData } from '@/features/laboratory/hooks/useLaboratoryModuleData';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import {
  ClipboardList,
  Syringe,
  Activity,
  CheckCircle2,
  FileText,
  Shield,
  Settings,
  Users
} from 'lucide-react';

export default function LaboratoryDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const workerId = user?.uid || 'worker-1';

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  const { data: ordersData, isLoading: loadingOrders } = useLaboratoryModuleData(workerId, 'orders');
  const { data: samplesData, isLoading: loadingSamples } = useLaboratoryModuleData(workerId, 'samples');
  const { data: processingData, isLoading: loadingProc } = useLaboratoryModuleData(workerId, 'processing');
  const { data: reportsData, isLoading: loadingRep } = useLaboratoryModuleData(workerId, 'reports');

  const isLoading = loadingOrders || loadingSamples || loadingProc || loadingRep;

  if (isLoading) return <LoadingState variant="card" />;

  const orders = (ordersData as any[]) || [];
  const samples = (samplesData as any[]) || [];
  const processing = (processingData as any[]) || [];
  const reports = (reportsData as any[]) || [];

  const collectedSamples = samples.filter(s => s.status === 'Collected').length;
  const completedReports = reports.filter(r => r.status === 'Completed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {t("laboratory.good") || 'Good'} {today.getHours() < 12 ? 'morning' : 'afternoon'}, Tech {user?.fullName?.split(' ').pop() || 'Workspace'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr} · Main Laboratory</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, sub: 'Pending and urgent', icon: ClipboardList, color: 'blue', href: '/dashboard/laboratory/orders' },
          { label: 'Collected Samples', value: collectedSamples, sub: 'Ready for processing', icon: Syringe, color: 'emerald', href: '/dashboard/laboratory/samples' },
          { label: 'Processing Queue', value: processing.length, sub: 'Currently in analyzers', icon: Activity, color: 'amber', href: '/dashboard/laboratory/processing' },
          { label: 'Completed Reports', value: completedReports, sub: 'Finalized today', icon: CheckCircle2, color: 'indigo', href: '/dashboard/laboratory/reports' }
        ].map((kpi, i) => {
          const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
            indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
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
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">Orders needing immediate attention</p>
              </div>
              <Link href="/dashboard/laboratory/orders" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      O
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{order.test}</p>
                      <p className="text-[11px] text-slate-400">Patient: {order.patient} · {order.orderedTime}</p>
                    </div>
                  </div>
                  <span className={cn('px-2 py-1 text-[10px] font-semibold rounded-md flex-shrink-0',
                    order.priority === 'Urgent' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                    'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                  )}>
                    {order.priority}
                  </span>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">No recent orders</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Enter Results', icon: FileText, color: 'text-blue-600', href: '/dashboard/laboratory/results' },
                { label: 'Run QC', icon: Shield, color: 'text-emerald-600', href: '/dashboard/laboratory/qc' },
                { label: 'Eq. Status', icon: Settings, color: 'text-amber-600', href: '/dashboard/laboratory/equipment' },
                { label: 'Patients', icon: Users, color: 'text-purple-600', href: '/dashboard/laboratory/patients' }
              ].map((item, i) => (
                <Link key={i} href={item.href} className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <item.icon className={cn('h-5 w-5', item.color)} />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}