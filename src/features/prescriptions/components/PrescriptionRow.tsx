'use client';

import React from 'react';
import { Calendar, Stethoscope, ChevronRight, RefreshCw } from 'lucide-react';
import { PrescriptionRecord } from '../types';

interface PrescriptionRowProps {
  prescription: PrescriptionRecord;
  onClick: () => void;
}

export function PrescriptionRow({ prescription, onClick }: PrescriptionRowProps) {
  const { doctorName, hospitalName, diagnosis, medicines, status, refillsRemaining, refillsAllowed } = prescription;

  const dateStr = prescription.metadata?.createdAt
    ? new Date(
        (prescription.metadata.createdAt as { toDate?: () => Date }).toDate
          ? (prescription.metadata.createdAt as { toDate: () => Date }).toDate()
          : (prescription.metadata.createdAt as string)
      ).toLocaleDateString()
    : 'Recent';

  // Status Badge Color Map
  const statusColors: Record<string, string> = {
    Draft: 'bg-yellow-50 text-yellow-700 border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
    Completed: 'bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900',
    Suspended: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
    Expired: 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
    Cancelled: 'bg-slate-50 text-slate-700 border-slate-250 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-900',
  };

  const statusBadge = statusColors[status] || statusColors.Draft;

  return (
    <div
      onClick={onClick}
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200 gap-4"
    >
      {/* Left section: Doctor details and diagnosis */}
      <div className="flex gap-4.5 w-full sm:w-auto">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {doctorName}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${statusBadge}`}>
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">{hospitalName}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold pt-1">
            Diagnosis: <span className="font-bold">{diagnosis}</span>
          </p>
        </div>
      </div>

      {/* Middle/Right section: Metadata */}
      <div className="flex flex-wrap items-center sm:justify-end gap-4 w-full sm:w-auto text-xs shrink-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-slate-850 sm:border-0">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-4 w-4" />
          <span>{dateStr}</span>
        </div>

        {/* Medicines quantity count */}
        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-350 font-bold">
          {medicines.length} Medication{medicines.length > 1 ? 's' : ''}
        </div>

        {/* Refills status indicator */}
        {refillsAllowed > 0 ? (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-blue-700 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900">
            <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
            <span>Refills: {refillsRemaining} / {refillsAllowed}</span>
          </div>
        ) : (
          <div className="px-3 py-1 bg-slate-50 dark:bg-slate-950 text-slate-400 rounded-lg font-bold border border-slate-100 dark:border-slate-850">
            No Refills
          </div>
        )}

        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all hidden sm:block" />
      </div>
    </div>
  );
}

export default PrescriptionRow;
