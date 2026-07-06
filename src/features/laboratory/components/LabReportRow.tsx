'use client';

import React from 'react';
import { LabReportRecord } from '../types';
import { FileText, Eye, Printer, Archive, RotateCcw, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LabReportRowProps {
  report: LabReportRecord;
  onViewDetails: (report: LabReportRecord) => void;
  onPrint: (report: LabReportRecord) => void;
  onArchiveToggle: (report: LabReportRecord) => void;
  isProcessing: boolean;
}

export function LabReportRow({
  report,
  onViewDetails,
  onPrint,
  onArchiveToggle,
  isProcessing,
}: LabReportRowProps) {
  const dateStr = report.metadata?.createdAt
    ? new Date(
        (report.metadata.createdAt as { toDate?: () => Date }).toDate
          ? (report.metadata.createdAt as { toDate: () => Date }).toDate()
          : (report.metadata.createdAt as string)
      ).toLocaleDateString()
    : 'Recent';

  const isArchived = report.metadata?.status === 'ARCHIVED';

  // Count abnormal markers
  const abnormalCount = report.observations?.filter((obs) => obs.isAbnormal).length || 0;

  return (
    <div
      className={cn(
        'group flex flex-col md:flex-row md:items-center justify-between p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl hover:border-slate-350 dark:hover:border-slate-700 transition duration-200 shadow-sm hover:shadow-md gap-4',
        isArchived && 'opacity-65 bg-slate-50/50 dark:bg-slate-950/20'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-400 rounded-xl">
          <FileText className="h-6 w-6" />
        </div>
        <div className="space-y-1 text-left">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>{report.testName}</span>
            {abnormalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900 rounded-md">
                <ShieldAlert className="h-3 w-3" />
                <span>{abnormalCount} Abnormal</span>
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500">
            Ordered Date: <span className="font-semibold">{dateStr}</span> · Facility:{' '}
            <span className="font-semibold">{report.laboratoryName}</span>
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {report.observations?.slice(0, 3).map((obs) => (
              <span
                key={obs.parameter}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-md font-semibold border',
                  obs.isAbnormal
                    ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950'
                    : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800'
                )}
              >
                {obs.parameter}: {obs.value} {obs.unit}
              </span>
            ))}
            {report.observations && report.observations.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800 font-semibold">
                +{report.observations.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 self-end md:self-center">
        <button
          onClick={() => onViewDetails(report)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition duration-150"
        >
          <Eye className="h-4 w-4" />
          <span>Details</span>
        </button>
        <button
          onClick={() => onPrint(report)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition duration-150"
        >
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </button>
        <button
          onClick={() => onArchiveToggle(report)}
          disabled={isProcessing}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition duration-150',
            isArchived
              ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900'
              : 'text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900 dark:hover:bg-amber-950/25'
          )}
        >
          {isArchived ? (
            <>
              <RotateCcw className="h-4 w-4" />
              <span>Restore</span>
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
export default LabReportRow;
