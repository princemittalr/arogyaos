'use client';

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Grid Statistics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Columns Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-48 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
