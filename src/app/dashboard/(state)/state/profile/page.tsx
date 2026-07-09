'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { isDemoUser } from '@/config/demoAccounts';
import { useStateModuleData } from '@/features/state/hooks/useStateModuleData';

export default function ProfilePage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useStateModuleData(user?.uid || '');

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Profile" 
          description="Manage your State Health Officer profile." 
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={icons.UserCircle}
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
        title="Profile" 
        description="Manage your State Health Officer profile." 
      />
      
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400">
              SO
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dr. State Officer</h2>
              <p className="text-slate-500">Chief Medical Officer, State Department</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <div className="font-medium">{user?.email || 'state.demo@gmail.com'}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase">Role Permissions</label>
              <div className="font-medium">State Administrator (Level 1)</div>
            </div>
          </div>
        </div>
        
    </div>
  );
}
