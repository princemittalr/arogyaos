'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { isDemoUser } from '@/config/demoAccounts';
import { useStateModuleData } from '@/features/state/hooks/useStateModuleData';

export default function SyncPage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useStateModuleData(user?.uid || '');

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Offline Sync" 
          description="Manage data synchronization queues for offline deployments." 
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={icons.RefreshCw}
            title="No Data Available"
            description="This module requires active state-level data integration. Contact administration to configure your data pipelines."
          />
        </div>
      </div>
    );
  }

  const { districts } = data;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Offline Sync" 
        description="Manage data synchronization queues for offline deployments." 
      />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Offline Sync Overview</h2>
          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Last Synced</th>
                <th className="px-4 py-3">Pending Records</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              { districts.map((item: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.name || item.title || item.resource || item.id || 'Offline Sync Item ' + i}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.district || item.from || item.population || 'All Districts'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.hospitals || item.to || item.beds || item.severity || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.phcs || item.quantity || item.healthScore || item.time || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                      item.status === 'green' || item.status === 'optimal' || item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      item.status === 'yellow' || item.status === 'warning' || item.status === 'pending' || item.severity === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' :
                      item.status === 'red' || item.status === 'critical' || item.severity === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>
                      {item.status || item.severity || 'Active'}
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
