'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';

interface QuickActionItem {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: 'blue' | 'emerald' | 'purple' | 'amber';
}

interface QuickActionsProps {
  actions: QuickActionItem[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  const schemeMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white',
  };

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {actions.map((act, idx) => {
        const Icon = act.icon;
        const colorClass = schemeMap[act.color || 'blue'] || schemeMap.blue;

        return (
          <button
            key={idx}
            onClick={act.onClick}
            className={cn(
              componentStyles.card.base,
              'group p-5 text-left flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700'
            )}
          >
            <div className={cn('rounded-xl p-2.5 w-fit transition-all duration-300', colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {act.label}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {act.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
export default QuickActions;
