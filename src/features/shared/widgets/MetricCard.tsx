'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';

interface MetricCardProps {
  title: string;
  value: string | number;
  percentage: number; // 0 to 100
  color?: 'blue' | 'emerald' | 'amber' | 'red';
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  percentage,
  color = 'blue',
  description,
  className
}: MetricCardProps) {const { t } = useLanguage();
  const colorMap = {
    blue: {
      bar: 'bg-blue-600 dark:bg-blue-400',
      track: 'bg-blue-100 dark:bg-blue-900/30',
      text: t("common.text_blue_600_darktext_blue_400")
    },
    emerald: {
      bar: 'bg-emerald-600 dark:bg-emerald-400',
      track: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: t("common.text_emerald_600_darktext_emerald_400")
    },
    amber: {
      bar: 'bg-amber-600 dark:bg-amber-400',
      track: 'bg-amber-100 dark:bg-amber-900/30',
      text: t("common.text_amber_600_darktext_amber_400")
    },
    red: {
      bar: 'bg-red-600 dark:bg-red-400',
      track: 'bg-red-100 dark:bg-red-900/30',
      text: t("common.text_red_600_darktext_red_400")
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(componentStyles.card.base, 'p-6 space-y-4', className)}>
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </h3>
        </div>
        <span className={cn('text-sm font-bold', scheme.text)}>{percentage}%</span>
      </div>

      <div className="space-y-2">
        {/* Progress Track */}
        <div className={cn('h-2 w-full rounded-full overflow-hidden', scheme.track)}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full', scheme.bar)} />
          
        </div>
        {description &&
        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            {description}
          </p>
        }
      </div>
    </motion.div>);

}
export default MetricCard;