'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, EmptyState } from '@/features/shared';
import { ShieldAlert, UserCircle } from 'lucide-react';
import { isDemoUser } from '@/config/demoAccounts';
import { useAdminModuleData } from '@/features/admin/hooks/useAdminModuleData';

export default function ProfilePage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useAdminModuleData(user?.email);

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Profile" 
          description="Manage your Administrator profile." 
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={UserCircle || ShieldAlert}
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
        title="Profile" 
        description="Manage your Administrator profile." 
      />
      
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400">
              AD
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Super Administrator</h2>
              <p className="text-slate-500">Platform Architect</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <div className="font-medium">{user?.email || 'admin.demo@gmail.com'}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase">Role Permissions</label>
              <div className="font-medium">God Mode (Level 0)</div>
            </div>
          </div>
        </div>
        
    </div>
  );
}
