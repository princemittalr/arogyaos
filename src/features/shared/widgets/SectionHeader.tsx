'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800', className)}>
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
export default SectionHeader;
