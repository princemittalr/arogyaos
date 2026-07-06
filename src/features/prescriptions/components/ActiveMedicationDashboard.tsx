'use client';

import React from 'react';
import { Pill, Sun, Clock, Sunset, CheckCircle2 } from 'lucide-react';
import { useActiveMedications } from '../hooks/useActiveMedications';
import { PrescriptionRecord } from '../types';

interface ActiveMedicationDashboardProps {
  prescriptions: PrescriptionRecord[];
}

export function ActiveMedicationDashboard({ prescriptions }: ActiveMedicationDashboardProps) {
  const { activeMedications, groupedByTime } = useActiveMedications(prescriptions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Compliance / Progress Trackers */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Active Treatment Courses</span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Current medication timelines and remaining durations.
          </p>
        </div>

        <div className="space-y-4.5">
          {activeMedications.map((item, idx) => (
            <div
              key={`${item.prescriptionId}-${idx}`}
              className="p-4 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/40 dark:bg-slate-950/10 space-y-2.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {item.medicine.name}
                  </h4>
                  <p className="text-[11px] text-slate-550 font-bold">
                    {item.medicine.strength} &bull; {item.medicine.dosage.timing}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                    {item.daysRemaining} days left
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Course: {item.totalDays} Days
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>Day {item.totalDays - item.daysRemaining}</span>
                  <span>{item.progressPercentage}% Complete</span>
                </div>
              </div>
            </div>
          ))}

          {activeMedications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2.5">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350">
                All Cleared!
              </p>
              <p className="text-xs text-slate-450 font-semibold max-w-xs">
                No active medication courses are running currently.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Dose Routine Schedule */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Daily Routine</span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Today&apos;s scheduled medication timings.
          </p>
        </div>

        <div className="space-y-4">
          {/* Morning Doses */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 shrink-0">
              <Sun className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Morning Dose
              </h4>
              {groupedByTime.morning.length > 0 ? (
                <div className="space-y-1">
                  {groupedByTime.morning.map((med, idx) => (
                    <p key={idx} className="text-sm font-extrabold text-slate-800 dark:text-slate-250 truncate">
                      {med.medicine.name} <span className="font-semibold text-xs text-slate-450">({med.medicine.strength})</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No scheduled morning medicines.</p>
              )}
            </div>
          </div>

          {/* Afternoon Doses */}
          <div className="flex items-start gap-4 pt-3 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Afternoon Dose
              </h4>
              {groupedByTime.afternoon.length > 0 ? (
                <div className="space-y-1">
                  {groupedByTime.afternoon.map((med, idx) => (
                    <p key={idx} className="text-sm font-extrabold text-slate-800 dark:text-slate-255 truncate">
                      {med.medicine.name} <span className="font-semibold text-xs text-slate-450">({med.medicine.strength})</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No scheduled afternoon medicines.</p>
              )}
            </div>
          </div>

          {/* Evening Doses */}
          <div className="flex items-start gap-4 pt-3 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 shrink-0">
              <Sunset className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Evening Dose
              </h4>
              {groupedByTime.evening.length > 0 ? (
                <div className="space-y-1">
                  {groupedByTime.evening.map((med, idx) => (
                    <p key={idx} className="text-sm font-extrabold text-slate-800 dark:text-slate-255 truncate">
                      {med.medicine.name} <span className="font-semibold text-xs text-slate-450">({med.medicine.strength})</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No scheduled evening medicines.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActiveMedicationDashboard;
