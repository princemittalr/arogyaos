'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    // General
    active: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
    inactive: { bg: 'bg-slate-100 dark:bg-slate-900', text: 'text-slate-500 dark:text-slate-400' },
    pending: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
    error: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
    
    // Appointment statuses
    scheduled: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
    checked_in: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400' },
    completed: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
    cancelled: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400' },
    
    // Inventory and redistribution statuses
    low_stock: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600 dark:text-red-400' },
    out_of_stock: { bg: 'bg-rose-100 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-450' },
    normal: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
  };

  const scheme = statusMap[status.toLowerCase()] || {
    bg: 'bg-slate-100 dark:bg-slate-900',
    text: 'text-slate-600 dark:text-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        scheme.bg,
        scheme.text,
        className
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
export default StatusBadge;
