'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';
import Link from 'next/link';

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
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  href?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  variant = 'default',
  href,
}: StatCardProps) {
  const variants = {
    default: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
  };

  const card = (
    <motion.div
      whileHover={href ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        componentStyles.card.base,
        'p-5 flex flex-col justify-between transition-all duration-200',
        href && 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2', variants[variant])}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-[11px] font-semibold', trend.isPositive ? 'text-emerald-600' : 'text-red-500')}>
            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}%
          </div>
        )}
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {value}
      </p>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
        {title}
      </p>
      {description && (
        <span className="text-[11px] text-slate-400 mt-1">{description}</span>
      )}
    </motion.div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}
export default StatCard;
