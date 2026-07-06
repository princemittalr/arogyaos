'use client';

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { PrescriptionRecord } from '../types';

interface MedicationTimelineProps {
  prescriptions: PrescriptionRecord[];
}

function resolveDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && 'toDate' in val) {
    const obj = val as { toDate?: () => unknown };
    if (typeof obj.toDate === 'function') {
      const date = obj.toDate();
      if (date instanceof Date) {
        return date;
      }
    }
  }
  return new Date(val as string | number);
}

export function MedicationTimeline({ prescriptions }: MedicationTimelineProps) {
  // Define timeline dates: 30 days starting from 7 days ago
  const daysArray = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date();
    base.setDate(base.getDate() - 7); // Start 7 days ago
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const timelineItems = useMemo(() => {
    if (!prescriptions) return [];
    const items: Array<{
      name: string;
      strength: string;
      pattern: string;
      start: Date;
      end: Date;
    }> = [];

    // Filter active prescriptions
    const activeRx = prescriptions.filter(
      (rx) => rx.status === 'Active' && rx.metadata?.status === 'ACTIVE'
    );

    for (const rx of activeRx) {
      for (const med of rx.medicines) {
        const start = resolveDate(med.schedule.startDate);
        const end = resolveDate(med.schedule.endDate);

        items.push({
          name: med.name,
          strength: med.strength,
          pattern: med.dosage.pattern,
          start,
          end,
        });
      }
    }

    return items;
  }, [prescriptions]);

  // Calculate Gantt bar column indices for a medicine
  const getGanttSpan = (start: Date, end: Date) => {
    const timelineStartMs = daysArray[0].getTime();
    const timelineEndMs = daysArray[daysArray.length - 1].getTime() + 24 * 60 * 60 * 1000; // end of last day

    // If course is entirely outside the 30-day window
    if (end.getTime() < timelineStartMs || start.getTime() > timelineEndMs) {
      return null;
    }

    const startMs = Math.max(start.getTime(), timelineStartMs);
    const endMs = Math.min(end.getTime(), timelineEndMs);

    // Calculate start day index (0-indexed, 1-based for CSS grid column)
    const startIndex = Math.floor((startMs - timelineStartMs) / (24 * 60 * 60 * 1000));
    const durationDays = Math.ceil((endMs - startMs) / (24 * 60 * 60 * 1000));

    return {
      gridColumnStart: startIndex + 1,
      gridColumnEnd: startIndex + 1 + Math.max(1, durationDays),
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Medication Gantt Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Visual calendar tracker across a 30-day treatment timeline.
          </p>
        </div>
      </div>

      {timelineItems.length > 0 ? (
        <div className="overflow-x-auto pt-2">
          {/* Gantt Matrix wrapper */}
          <div className="min-w-[760px] space-y-4">
            {/* Header row: Days list */}
            <div className="grid grid-cols-12 gap-0">
              {/* Left spacer for labels */}
              <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Medication
              </div>
              {/* Timeline days blocks */}
              <div className="col-span-9 grid grid-cols-30 gap-0.5">
                {daysArray.map((day, idx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center py-1 rounded text-[9px] font-bold ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                      title={day.toLocaleDateString()}
                    >
                      <span>{day.getDate()}</span>
                      <span className="text-[7px] uppercase font-semibold">
                        {day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gantt rows */}
            <div className="space-y-3.5">
              {timelineItems.map((item, index) => {
                const span = getGanttSpan(item.start, item.end);
                return (
                  <div key={index} className="grid grid-cols-12 items-center gap-0">
                    {/* Medicine Label */}
                    <div className="col-span-3 pr-4">
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold truncate">
                        {item.strength} &bull; {item.pattern}
                      </p>
                    </div>

                    {/* Gantt Bar Slot */}
                    <div className="col-span-9 relative bg-slate-50 dark:bg-slate-950/20 py-2.5 rounded-xl border border-slate-100 dark:border-slate-850 grid grid-cols-30 gap-0.5">
                      {/* Gantt Bar */}
                      {span && (
                        <div
                          className="absolute h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm border border-blue-400/20 opacity-85 flex items-center pl-2"
                          style={{
                            gridColumnStart: span.gridColumnStart,
                            gridColumnEnd: span.gridColumnEnd,
                            top: '4px',
                          }}
                        >
                          <span className="text-[8px] font-extrabold text-white truncate pr-1">
                            Active
                          </span>
                        </div>
                      )}

                      {/* Ghost columns grid helpers */}
                      {Array.from({ length: 30 }).map((_, colIdx) => (
                        <div
                          key={colIdx}
                          className="h-4 border-r border-dashed border-slate-200/40 dark:border-slate-800/20 last:border-none"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-xs italic text-slate-400">
          No medication timelines to display.
        </div>
      )}
    </div>
  );
}

export default MedicationTimeline;
