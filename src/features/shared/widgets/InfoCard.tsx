'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';

interface InfoItem {
  label: string;
  value: React.ReactNode;
}

interface InfoCardProps {
  title: string;
  items: InfoItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function InfoCard({ title, items, actions, className }: InfoCardProps) {
  return (
    <div className={cn(componentStyles.card.base, 'p-6 flex flex-col justify-between', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">{title}</h4>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <dl className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-0.5">
              <dt className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</dt>
              <dd className="text-slate-900 dark:text-slate-200 font-semibold text-right">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
export default InfoCard;
