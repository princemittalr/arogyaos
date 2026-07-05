'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';
import { LoadingState } from '../widgets/LoadingState';

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  loading,
  empty,
  emptyMessage = 'No analytical records found for the selected period.',
  children,
  actions,
  className,
}: ChartCardProps) {
  return (
    <div className={cn(componentStyles.card.base, 'p-6 flex flex-col justify-between', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="space-y-0.5">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">{title}</h4>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Content Area */}
        <div className="h-64 w-full flex items-center justify-center">
          {loading ? (
            <LoadingState variant="chart" className="border-none bg-transparent p-0 w-full h-full" />
          ) : empty ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
            </div>
          ) : (
            <div className="w-full h-full min-h-[240px] relative">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ChartCard;
