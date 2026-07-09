'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { isDemoUser } from '@/config/demoAccounts';
import { useStateModuleData } from '@/features/state/hooks/useStateModuleData';

export default function SurveillancePage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useStateModuleData(user?.uid || '');

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Disease Surveillance" 
          description="Monitor outbreaks and disease trends statewide." 
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={icons.Activity}
            title="No Data Available"
            description="This module requires active state-level data integration. Contact administration to configure your data pipelines."
          />
        </div>
      </div>
    );
  }

  const { alerts } = data;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Disease Surveillance" 
        description="Monitor outbreaks and disease trends statewide." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        { alerts.map((item: any, i: number) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <icons.Activity className="h-5 w-5" />
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                item.status === 'green' || item.status === 'optimal' || item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                item.status === 'yellow' || item.status === 'warning' || item.status === 'pending' || item.severity === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                item.status === 'red' || item.status === 'critical' || item.severity === 'high' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-slate-50 text-slate-600 border border-slate-200'
              }`}>
                {item.status || item.severity || 'Active'}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.name || item.title || item.resource || 'Disease Surveillance'}</h3>
            <p className="text-sm text-slate-500 mb-4">{item.district || item.from || 'Statewide Integration'}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Metric 1</span>
                <span className="font-semibold">{item.hospitals || item.quantity || item.bedsOccupied || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Metric 2</span>
                <span className="font-semibold">{item.healthScore || item.doctors || item.time || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
