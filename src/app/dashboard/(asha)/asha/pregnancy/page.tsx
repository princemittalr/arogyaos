'use client';

import React from 'react';
import { PageHeader, EmptyState } from '@/features/shared';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useAshaModuleData } from '@/features/community-health/hooks/useAshaModuleData';
import { LoadingState } from '@/features/shared';
import { icons } from '@/design-system/icons';

export default function AshaPregnancyPage() {
  const { user } = useAuth();
  const workerId = user?.uid || 'worker-1';
  const { data, isLoading } = useAshaModuleData(workerId, 'pregnancy');

  const { t } = useLanguage();
  if (isLoading) return <LoadingState variant="card" />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pregnancy Tracking" 
        description="Monitor expected delivery dates, trimesters, and ANC visits." 
      />
      {!data || data.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <EmptyState 
          icon={icons.Baby}
          title="No Active Pregnancies"
          description="There are currently no active pregnancies tracked in your assigned households."
          action={{ label: "", onClick: () => {} }}
        />
      </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item: any) => (
            <div key={item.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="font-bold text-slate-900 dark:text-slate-100">{item.name || item.title || item.topic || item.patient || item.month || item.type}</div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                {Object.entries(item).filter(([k]) => k !== 'id' && k !== 'name' && k !== 'title' && k !== 'topic' && k !== 'patient' && k !== 'month' && k !== 'type').map(([k, v]) => (
                  <div key={k}><span className="font-semibold capitalize">{k.replace(/([A-Z])/g, ' ').trim()}:</span> {Array.isArray(v) ? v.join(', ') : String(v)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
