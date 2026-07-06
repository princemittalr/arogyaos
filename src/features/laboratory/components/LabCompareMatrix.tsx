'use client';

import React from 'react';
import { LabReportRecord } from '../types';
import { CheckSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LabCompareMatrixProps {
  reports: LabReportRecord[];
}

export function LabCompareMatrix({ reports }: LabCompareMatrixProps) {
  // Extract active records
  const activeReports = React.useMemo(() => {
    return (reports || [])
      .filter((r) => r.metadata?.status === 'ACTIVE')
      .slice(0, 4); // Limit to last 4 reports for layout neatness
  }, [reports]);

  // Extract all unique parameters and reference ranges
  const parametersData = React.useMemo(() => {
    const params: Record<string, { unit: string; referenceRange: string }> = {};
    activeReports.forEach((r) => {
      r.observations?.forEach((obs) => {
        if (obs.parameter) {
          params[obs.parameter] = {
            unit: obs.unit,
            referenceRange: obs.referenceRange,
          };
        }
      });
    });
    return params;
  }, [activeReports]);

  if (activeReports.length < 2) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 font-semibold">
        At least two active laboratory reports are required to generate a comparison matrix.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="text-left">
        <h3 className="font-extrabold text-base text-slate-950 dark:text-slate-50 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <span>Multi-Report Comparison Matrix</span>
        </h3>
        <p className="text-xs text-slate-400 font-semibold">
          Side-by-side view comparing biomarker values across different diagnostic dates
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850">
        <table className="w-full text-left text-xs border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 border-b border-slate-100 dark:border-slate-850">
              <th className="p-3.5 font-extrabold uppercase">Biomarker</th>
              {activeReports.map((r, idx) => {
                const dateStr = r.metadata?.createdAt
                  ? new Date(
                      (r.metadata.createdAt as { toDate?: () => Date }).toDate
                        ? (r.metadata.createdAt as { toDate: () => Date }).toDate()
                        : (r.metadata.createdAt as string)
                    ).toLocaleDateString()
                  : 'Recent';
                return (
                  <th key={idx} className="p-3.5 font-extrabold uppercase">
                    {dateStr}
                    <span className="block text-[9px] font-normal lowercase text-slate-400">
                      {r.testName.substring(0, 15)}...
                    </span>
                  </th>
                );
              })}
              <th className="p-3.5 font-extrabold uppercase">Reference Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {Object.keys(parametersData).map((param) => {
              const meta = parametersData[param];
              return (
                <tr key={param} className="hover:bg-slate-50/20">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{param}</td>
                  {activeReports.map((r, idx) => {
                    const obs = r.observations?.find(
                      (o) => o.parameter.toLowerCase().trim() === param.toLowerCase().trim()
                    );
                    if (!obs) {
                      return (
                        <td key={idx} className="p-3.5 text-slate-400 font-semibold">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={idx} className="p-3.5">
                        <span
                          className={cn(
                            'font-extrabold block',
                            obs.isAbnormal ? 'text-rose-600' : 'text-slate-805 dark:text-slate-100'
                          )}
                        >
                          {obs.value} {obs.unit}
                        </span>
                        {obs.isAbnormal && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-rose-700 bg-rose-50 px-1 rounded uppercase">
                            <AlertCircle className="h-2 w-2" />
                            <span>Abnormal</span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3.5 text-slate-450 font-semibold">
                    {meta.referenceRange} {meta.unit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default LabCompareMatrix;
