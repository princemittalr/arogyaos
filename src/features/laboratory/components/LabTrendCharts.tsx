'use client';

import React, { useState } from 'react';
import { LabReportRecord } from '../types';
import { useLabTrends } from '../hooks/useLabTrends';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LabTrendChartsProps {
  reports: LabReportRecord[];
}

export function LabTrendCharts({ reports }: LabTrendChartsProps) {
  const [selectedParameter, setSelectedParameter] = useState<string>('Hemoglobin');
  const { trendData, uniqueParameters } = useLabTrends(reports, selectedParameter);

  // Set default selection if empty
  React.useEffect(() => {
    if (uniqueParameters.length > 0 && !uniqueParameters.includes(selectedParameter)) {
      setSelectedParameter(uniqueParameters[0]);
    }
  }, [uniqueParameters, selectedParameter]);

  // Compute SVG dimensions and path coordinates
  const width = 500;
  const height = 200;
  const padding = 35;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = React.useMemo(() => {
    if (trendData.length === 0) return [];

    const values = trendData.map((t) => t.value);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;
    const range = maxVal - minVal || 1;

    return trendData.map((t, idx) => {
      const x = padding + (idx / (trendData.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((t.value - minVal) / range) * chartHeight;
      return { x, y, ...t };
    });
  }, [trendData, chartWidth, chartHeight]);

  const svgPath = React.useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
      
      {/* Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-left">
          <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-950 dark:text-slate-50">
              Biomarker Trend Tracker
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Select any biomarker to view historical values in chronological order
            </p>
          </div>
        </div>

        {/* Parameter picker */}
        {uniqueParameters.length > 0 ? (
          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
          >
            {uniqueParameters.map((param) => (
              <option key={param} value={param}>
                {param}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-slate-400 font-semibold">No data points available</p>
        )}
      </div>

      {/* SVG Canvas */}
      {trendData.length > 0 ? (
        <div className="space-y-4">
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-xl mx-auto overflow-visible"
            >
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1.5" className="dark:stroke-slate-800" />
              <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="#f1f5f9" strokeWidth="1.5" className="dark:stroke-slate-800" />
              <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#e2e8f0" strokeWidth="2" className="dark:stroke-slate-800" />

              {/* Sparkline Path */}
              {svgPath && (
                <path
                  d={svgPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="6.5"
                    className={cn(
                      'fill-white stroke-2 transition duration-150',
                      p.isAbnormal ? 'stroke-rose-600' : 'stroke-blue-600'
                    )}
                  />
                  {/* Tooltip hovering label */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold fill-slate-700 dark:fill-slate-200 hidden group-hover:block"
                  >
                    {p.value}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Table list of points */}
          <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 border-b border-slate-100 dark:border-slate-850">
                  <th className="p-3 font-extrabold uppercase">Date</th>
                  <th className="p-3 font-extrabold uppercase">Observation Value</th>
                  <th className="p-3 font-extrabold uppercase">Reference Unit</th>
                  <th className="p-3 font-extrabold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {trendData.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-350">{pt.date}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-slate-50">{pt.value}</td>
                    <td className="p-3 text-slate-500">{pt.unit}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border',
                          pt.isAbnormal
                            ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-450'
                        )}
                      >
                        {pt.isAbnormal && <AlertTriangle className="h-3 w-3" />}
                        <span>{pt.isAbnormal ? 'Abnormal' : 'Normal'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-semibold">
          No trends available. Upload some diagnostic reports to begin tracking blood parameters.
        </div>
      )}

    </div>
  );
}
export default LabTrendCharts;
