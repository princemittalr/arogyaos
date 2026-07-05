'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(componentStyles.card.base, 'p-6 flex flex-col justify-between', className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </h3>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-slate-600 dark:bg-slate-950 dark:text-slate-350">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'font-bold inline-flex items-center rounded-full px-2 py-0.5',
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-slate-500 dark:text-slate-450">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
export default StatCard;
