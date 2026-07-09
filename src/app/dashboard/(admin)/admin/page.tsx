'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { ShieldAlert, HardDrive, Globe, Shield, Users, Database, Building2, Terminal, ClipboardList } from 'lucide-react';
import { isDemoUser } from '@/config/demoAccounts';
import { useAdminModuleData } from '@/features/admin/hooks/useAdminModuleData';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const MetricCard = ({ label, value, subtext, icon: Icon, color = 'blue' }: any) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {subtext && <p className="mt-1 text-xs font-medium text-slate-500">{subtext}</p>}
        </div>
        <div className={cn('rounded-xl p-3', colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useAdminModuleData(user?.email);

  if (isLoading) return <LoadingState />;

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Enterprise Command Center" description="Global platform administration and monitoring." />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={ShieldAlert}
            title="Awaiting System Connection"
            description="Your account is not connected to any active clusters. Contact DevOps."
          />
        </div>
      </div>
    );
  }

  const { metrics, nodes } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Enterprise Command Center" description="Global platform administration and realtime observability." />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400 text-xs font-bold shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> CLUSTER ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={metrics.totalUsers.toLocaleString()} subtext={`${metrics.activeSessions} active sessions`} icon={Users} color="blue" />
        <MetricCard label="API Health" value={`${metrics.apiHealth}%`} subtext={`Database Load: ${metrics.databaseLoad}%`} icon={Terminal} color="emerald" />
        <MetricCard label="Total Hospitals" value={metrics.totalHospitals} subtext={`Across ${metrics.totalStates} states`} icon={Building2} color="indigo" />
        <MetricCard label="Storage" value={metrics.storageUsed} subtext="Bucket utilization" icon={HardDrive} color="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Platform Overview', desc: 'System topology', icon: Globe, href: '/dashboard/admin/platform', color: 'text-indigo-600' },
          { label: 'Security Center', desc: 'Threat detection', icon: Shield, href: '/dashboard/admin/security', color: 'text-red-600' },
          { label: 'Audit Logs', desc: 'System trails', icon: ClipboardList, href: '/dashboard/admin/audit', color: 'text-amber-600' },
          { label: 'Database Health', desc: 'Performance', icon: Database, href: '/dashboard/admin/database', color: 'text-blue-600' }
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition text-center">
            <item.icon className={cn('h-6 w-6', item.color)} />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
