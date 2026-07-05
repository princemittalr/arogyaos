import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';

interface PredictionCardProps {
  label: string;
  expectedValue: string | number;
  timeframe: string;
  confidence: number;
  reasoning: string;
}

export function PredictionCard({
  label,
  expectedValue,
  timeframe,
  confidence,
  reasoning,
}: PredictionCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3.5 hover:border-slate-300 dark:hover:border-slate-750 transition duration-200">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded">
            {timeframe}
          </span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{label}</p>
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5">
        <p className="text-[9px] text-slate-450 uppercase font-semibold">Predicted Level</p>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{expectedValue}</p>
      </div>

      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
        Reasoning: {reasoning}
      </p>
    </div>
  );
}

export default PredictionCard;
