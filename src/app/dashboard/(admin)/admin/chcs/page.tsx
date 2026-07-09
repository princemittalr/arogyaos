'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, EmptyState } from '@/features/shared';
import { ShieldAlert, MapPin } from 'lucide-react';
import { isDemoUser } from '@/config/demoAccounts';
import { useAdminModuleData } from '@/features/admin/hooks/useAdminModuleData';

export default function ChcsPage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useAdminModuleData(user?.email);

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="CHCs" 
          description="Community Health Center management." 
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={MapPin || ShieldAlert}
            title="No Data Available"
            description="This module requires active system integration. Contact DevOps."
          />
        </div>
      </div>
    );
  }

  const { nodes } = data;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="CHCs" 
        description="Community Health Center management." 
      />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">CHCs Feed</h2>
          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Export Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">CHC</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Patients</th>
                <th className="px-4 py-3">Uptime</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              { nodes.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.name || item.timestamp || 'CHCs Item ' + i}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.type || item.user || 'System'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.users || item.module || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.uptime || item.action || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                      item.status === 'optimal' || item.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      item.status === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' :
                      item.status === 'critical' || item.status === 'failed' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>
                      {item.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
