'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        componentStyles.card.base,
        'p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2 bg-transparent dark:bg-transparent',
        className
      )}
    >
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 p-4">
        <Icon className="h-8 w-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="font-bold text-lg text-slate-900 dark:text-slate-50">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className={`${componentStyles.button.base} ${componentStyles.button.primary} px-5 py-2.5 mt-2`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
export default EmptyState;
