import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

export function AIInsightCard({
  title,
  value,
  description,
  icon: Icon = HelpCircle,
  trend,
}: AIInsightCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">{title}</span>
        <Icon className="h-4.5 w-4.5 text-blue-500 shrink-0" />
      </div>

      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend && (
            <span className={`text-[9px] font-black uppercase px-1 rounded ${
              trend.direction === 'up' ? 'bg-emerald-50 text-emerald-650' : 'bg-red-50 text-red-650'
            }`}>
              {trend.value}
            </span>
          )}
          <p className="text-[10px] text-slate-450 font-semibold">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default AIInsightCard;
