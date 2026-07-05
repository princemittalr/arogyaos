'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/features/shared';
import { useHealthScore } from '@/features/ai/hooks/useAI';
import type { HealthScoreInput } from '@/features/ai/services/healthScore.service';
import { Sparkles, ShieldCheck, ShieldAlert, ShieldX, Activity, Loader2 } from 'lucide-react';

const defaultInput: HealthScoreInput = {
  bedOccupancyPercent: 78,
  medicineStockoutPercent: 12,
  staffAttendancePercent: 88,
  activeAlertsCount: 2,
  appointmentsCount: 145,
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'excellent') return <ShieldCheck className="h-8 w-8 text-emerald-500" />;
  if (status === 'stable') return <ShieldCheck className="h-8 w-8 text-blue-500" />;
  if (status === 'warning') return <ShieldAlert className="h-8 w-8 text-amber-500" />;
  return <ShieldX className="h-8 w-8 text-red-500" />;
}

function ScoreArc({ score }: { score: number }) {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const color = clampedScore >= 85 ? '#10b981' : clampedScore >= 70 ? '#3b82f6' : clampedScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-800" />
          <circle
            cx="50" cy="50" r="40" fill="none" strokeWidth="10"
            stroke={color}
            strokeDasharray={`${(clampedScore / 100) * 251.2} 251.2`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900 dark:text-slate-50" style={{ color }}>{clampedScore}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">/ 100</span>
        </div>
      </div>
    </div>
  );
}

export default function HospitalAIHealthScorePage() {
  const [input, setInput] = useState<HealthScoreInput>(defaultInput);
  const [run, setRun] = useState(false);

  const { data: result, isLoading, refetch } = useHealthScore(input, run);

  const handleRun = () => {
    setRun(true);
    if (run) refetch();
  };

  const handleInputChange = (key: keyof HealthScoreInput, value: number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Hospital Health Score"
        description="Gemini AI calculates a 0–100 operational health score based on bed occupancy, medicine availability, attendance, and active alerts."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-blue-500" /> Hospital Metrics Input
          </h3>

          <div className="space-y-5 text-xs font-bold text-slate-800 dark:text-slate-200">
            {([
              { key: 'bedOccupancyPercent', label: 'Bed Occupancy (%)', min: 0, max: 100 },
              { key: 'medicineStockoutPercent', label: 'Medicine Stockout (%)', min: 0, max: 100 },
              { key: 'staffAttendancePercent', label: 'Staff Attendance (%)', min: 0, max: 100 },
              { key: 'activeAlertsCount', label: 'Active Alerts (count)', min: 0, max: 20 },
              { key: 'appointmentsCount', label: 'Appointments Today', min: 0, max: 500 },
            ] as const).map(({ key, label, min, max }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold text-slate-500">{label}</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-50">{input[key]}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={input[key]}
                  onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleRun}
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-750 disabled:opacity-50 text-white py-3 text-[11px] font-extrabold flex items-center justify-center gap-2 transition"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Computing Score...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Calculate AI Health Score</>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-3 space-y-5">
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-pulse">
              <div className="h-36 w-36 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`h-3 rounded bg-slate-100 dark:bg-slate-800 ${i === 2 ? 'w-3/4' : 'w-full'}`} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && result && (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <StatusIcon status={result.operationalStatus} />
                  <ScoreArc score={result.healthScore} />
                  <div className="text-center">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-slate-50 capitalize">{result.operationalStatus} Status</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">AI computed operational health assessment</p>
                  </div>
                </div>
              </div>

              {/* Factor Breakdown */}
              {result.factors?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">Factor Breakdown</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {result.factors.map((factor: { metricName: string; impactScore: number; notes: string }, idx: number) => (
                      <div key={idx} className="py-3 flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-slate-50">{factor.metricName}</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">{factor.notes}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          factor.impactScore >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {factor.impactScore >= 0 ? '+' : ''}{factor.impactScore} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {result.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!isLoading && !result && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center gap-3 text-center">
              <ShieldCheck className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Configure metrics and run the AI assessment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
