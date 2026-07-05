'use client';

import React from 'react';
import { cn } from '@/utils/cn';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  const dotColorMap = {
    info: 'bg-blue-500 ring-blue-100 dark:ring-blue-900/30',
    success: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/30',
    warning: 'bg-amber-500 ring-amber-100 dark:ring-amber-900/30',
    error: 'bg-red-500 ring-red-100 dark:ring-red-900/30',
  };

  return (
    <div className={cn('relative border-l border-slate-200 pl-6 dark:border-slate-800 space-y-6', className)}>
      {events.map((event) => {
        const dotColor = dotColorMap[event.type || 'info'] || dotColorMap.info;

        return (
          <div key={event.id} className="relative group">
            {/* Timeline dot */}
            <span
              className={cn(
                'absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 transition-all duration-300 group-hover:scale-110',
                dotColor
              )}
            />
            {/* Event content */}
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h5 className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                  {event.title}
                </h5>
                <span className="text-xs text-slate-400 dark:text-slate-500">{event.time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ActivityTimeline;
