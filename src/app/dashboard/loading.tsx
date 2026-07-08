'use client';

import React from 'react';
import { componentStyles } from '@/design-system/components';
import { motion } from 'framer-motion';

export default function DashboardLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
        <div className="space-y-3">
          <div className="h-9 w-48 skeleton rounded-lg" />
          <div className="h-4 w-72 skeleton rounded-md opacity-60" />
        </div>
        <div className="h-11 w-32 skeleton rounded-xl mt-4 md:mt-0" />
      </div>

      {/* Grid Statistics Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={componentStyles.card.base}>
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-24 skeleton rounded opacity-80" />
              <div className="h-8 w-8 skeleton rounded-lg" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-8 w-20 skeleton rounded" />
              <div className="h-3 w-32 skeleton rounded opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Columns Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2 pt-2">
        <div className={`${componentStyles.card.base} space-y-6`}>
          <div className="h-6 w-36 skeleton rounded opacity-80" />
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 skeleton rounded-full" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-1/3 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${componentStyles.card.base} space-y-6`}>
          <div className="h-6 w-36 skeleton rounded opacity-80" />
          <div className="h-[280px] w-full skeleton rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
}
