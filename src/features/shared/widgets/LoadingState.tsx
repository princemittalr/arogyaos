'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingStateProps {
  variant?: 'card' | 'table' | 'chart';
  rows?: number;
  className?: string;
}

export function LoadingState({ variant = 'card', rows = 3, className }: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className={cn('w-full space-y-4 animate-pulse', className)}>
        {/* Table Header */}
        <div className="flex h-10 w-full items-center justify-between rounded-lg bg-slate-200 dark:bg-slate-800 px-4" />
        {/* Table Rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className="flex h-12 w-full items-center justify-between rounded-lg border border-slate-100 dark:border-slate-850 px-4"
            >
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/6 rounded bg-slate-150 dark:bg-slate-850" />
              <div className="h-4 w-1/5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-12 rounded bg-slate-150 dark:bg-slate-850" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div
        className={cn(
          'w-full h-64 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between animate-pulse',
          className
        )}
      >
        <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-end gap-3 h-40 w-full pt-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t-md bg-slate-100 dark:bg-slate-850"
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>
        <div className="h-3 w-1/2 rounded bg-slate-150 dark:bg-slate-850 mt-2" />
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse',
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-8 rounded-full bg-slate-150 dark:bg-slate-850" />
      </div>
      <div className="h-7 w-16 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-850" />
    </div>
  );
}
export default LoadingState;
