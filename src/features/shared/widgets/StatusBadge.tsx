'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {const { t } = useLanguage();
  const statusMap: Record<string, {bg: string;text: string;}> = {
    // General
    active: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: t("common.text_emerald_600_darktext_emerald_400") },
    inactive: { bg: 'bg-slate-100 dark:bg-slate-900', text: t("common.text_slate_500_darktext_slate_400") },
    pending: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: t("common.text_amber_600_darktext_amber_400") },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: t("common.text_emerald_600_darktext_emerald_400") },
    error: { bg: 'bg-red-50 dark:bg-red-950/20', text: t("common.text_red_600_darktext_red_400") },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: t("common.text_amber_600_darktext_amber_400") },

    // Appointment statuses
    scheduled: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: t("common.text_blue_600_darktext_blue_400") },
    checked_in: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: t("common.text_purple_600_darktext_purple_400") },
    completed: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: t("common.text_emerald_600_darktext_emerald_400") },
    cancelled: { bg: 'bg-red-50 dark:bg-red-950/20', text: t("common.text_red_600_darktext_red_400") },

    // Inventory and redistribution statuses
    low_stock: { bg: 'bg-red-50 dark:bg-red-950/20', text: t("common.text_red_600_darktext_red_400") },
    out_of_stock: { bg: 'bg-rose-100 dark:bg-rose-950/30', text: t("common.text_rose_600_darktext_rose_450") },
    normal: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: t("common.text_emerald_600_darktext_emerald_400") }
  };

  const scheme = statusMap[status.toLowerCase()] || {
    bg: 'bg-slate-100 dark:bg-slate-900',
    text: t("common.text_slate_600_darktext_slate_400")
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        scheme.bg,
        scheme.text,
        className
      )}>
      
      {status.replace('_', ' ')}
    </span>);

}
export default StatusBadge;