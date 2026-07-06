import { useLanguage } from "@/providers/LanguageProvider";import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';

interface AIRecommendationCardProps {
  title: string;
  description: string;
  suggestedAction: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  onAction?: () => void;
  actionLabel?: string;
  isActionPending?: boolean;
}

export function AIRecommendationCard({
  title,
  description,
  suggestedAction,
  confidence,
  priority,
  onAction,
  actionLabel = 'Apply Action',
  isActionPending = false
}: AIRecommendationCardProps) {const { t } = useLanguage();
  const isHigh = priority === 'high';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4 hover:border-slate-350 dark:hover:border-slate-750 transition duration-200">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
          isHigh ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' : 'bg-amber-50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400'}`
          }>
            {priority}{t("common.priority")}
          </span>
          <ConfidenceBadge confidence={confidence} />
        </div>

        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-500 shrink-0" /> {title}
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{description}</p>
      </div>

      <div className="space-y-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-850">
        <div className="text-[10px] text-blue-650 dark:text-blue-400 font-bold flex items-start gap-1">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{t("common.suggested_action")}{suggestedAction}</span>
        </div>

        {onAction &&
        <div className="flex justify-end">
            <button
            onClick={onAction}
            disabled={isActionPending}
            className="rounded-xl bg-slate-900 dark:bg-slate-50 dark:text-slate-950 hover:bg-slate-800 px-4 py-2 text-[10px] font-extrabold transition disabled:opacity-50">
            
              {isActionPending ? 'Processing...' : actionLabel}
            </button>
          </div>
        }
      </div>
    </div>);

}

export default AIRecommendationCard;