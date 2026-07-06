'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { PageHeader } from '@/features/shared';
import { useStockForecast } from '@/features/ai/hooks/useAI';
import { ConfidenceBadge } from '@/features/ai/components';
import type { StockForecastInput } from '@/features/ai/services/stockForecast.service';
import { Sparkles, RefreshCcw, AlertTriangle, TrendingDown, ShieldCheck } from 'lucide-react';

const SAMPLE_INVENTORY: StockForecastInput[] = [
{ medicineName: 'Paracetamol 650mg', category: 'Analgesics', quantity: 180, minimumStock: 500, weeklyConsumption: 420 },
{ medicineName: 'Amoxicillin 500mg', category: 'Antibiotics', quantity: 15, minimumStock: 100, weeklyConsumption: 70 },
{ medicineName: 'Metformin 500mg', category: 'Antidiabetics', quantity: 0, minimumStock: 300, weeklyConsumption: 210 },
{ medicineName: 'Pantoprazole 40mg', category: 'Gastrointestinal', quantity: 620, minimumStock: 200, weeklyConsumption: 140 },
{ medicineName: 'Azithromycin 500mg', category: 'Antibiotics', quantity: 8, minimumStock: 50, weeklyConsumption: 35 }];


export default function PharmacyAIForecastPage() {const { t } = useLanguage();
  const [triggerForecast, setTriggerForecast] = useState(false);

  const { data: forecasts, isLoading, refetch } = useStockForecast(SAMPLE_INVENTORY, triggerForecast);

  const handleRunForecast = () => {
    setTriggerForecast(true);
    if (triggerForecast) refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pharmacy.ai_medicine_stock_forecast")}
        description={t("pharmacy.gemini_ai_analyses_consumption_velocity_seasonal_trends_and_safety_thresholds_to_predict_future_stock_shortages")} />
      

      {/* Inventory input summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />{t("pharmacy.current_inventory_snapshot")}
          </h3>
          <button
            onClick={handleRunForecast}
            disabled={isLoading}
            className="rounded-xl bg-blue-600 hover:bg-blue-750 disabled:opacity-50 text-white px-4 py-2 text-[11px] font-extrabold flex items-center gap-1.5 transition">
            
            {isLoading ?
            <><RefreshCcw className="h-3.5 w-3.5 animate-spin" />{t("pharmacy.analysing")}</> :

            <><Sparkles className="h-3.5 w-3.5" />{t("pharmacy.run_ai_forecast")}</>
            }
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-850 text-[10px] text-slate-400 font-bold uppercase">
                <th className="pb-2.5">{t("pharmacy.medicine")}</th>
                <th className="pb-2.5">{t("pharmacy.category")}</th>
                <th className="pb-2.5 text-right">{t("pharmacy.stock")}</th>
                <th className="pb-2.5 text-right">{t("pharmacy.min_level")}</th>
                <th className="pb-2.5 text-right">{t("pharmacy.weekly_usage")}</th>
                <th className="pb-2.5 text-center">{t("pharmacy.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {SAMPLE_INVENTORY.map((item) => {
                const ratio = item.quantity / item.minimumStock;
                const status = item.quantity === 0 ? 'depleted' : ratio < 0.5 ? 'critical' : ratio < 1 ? 'low' : 'ok';
                return (
                  <tr key={item.medicineName} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-50">{item.medicineName}</td>
                    <td className="py-3 text-slate-400">{item.category}</td>
                    <td className="py-3 text-right font-bold">{item.quantity}{t("pharmacy.units")}</td>
                    <td className="py-3 text-right">{item.minimumStock}{t("pharmacy.units")}</td>
                    <td className="py-3 text-right">{item.weeklyConsumption}{t("pharmacy.wk")}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      status === 'depleted' ? 'bg-red-100 text-red-700' :
                      status === 'critical' ? 'bg-red-50 text-red-600' :
                      status === 'low' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-700'}`
                      }>
                        {status}
                      </span>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading skeletons */}
      {isLoading &&
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) =>
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-8 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
        )}
        </div>
      }

      {/* AI Forecast Results */}
      {!isLoading && forecasts && forecasts.length > 0 &&
      <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("pharmacy.ai_shortage_predictions")}

          </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forecasts.map((f: {
            medicineName: string;
            expectedShortageDate: string;
            confidence: number;
            riskLevel: 'high' | 'medium' | 'low';
            recommendedRefillQuantity: number;
            reasoning: string;
            suggestedAction: string;
          }) =>
          <div key={f.medicineName} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3.5 hover:border-slate-300 dark:hover:border-slate-750 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 dark:text-slate-50">{f.medicineName}</p>
                    <span className={`mt-1 inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                f.riskLevel === 'high' ? 'bg-red-50 text-red-650' :
                f.riskLevel === 'medium' ? 'bg-amber-50 text-amber-650' :
                'bg-emerald-50 text-emerald-650'}`
                }>
                      {f.riskLevel}{t("pharmacy.risk")}
                </span>
                  </div>
                  <ConfidenceBadge confidence={f.confidence} />
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[10px]">
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                    <p className="text-[8px] text-slate-400 uppercase font-semibold">{t("pharmacy.shortage_date")}</p>
                    <p className="font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">{f.expectedShortageDate}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                    <p className="text-[8px] text-slate-400 uppercase font-semibold">{t("pharmacy.refill_needed")}</p>
                    <p className="font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">{f.recommendedRefillQuantity}{t("pharmacy.units")}</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{f.reasoning}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-850 text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-start gap-1">
                  <TrendingDown className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {f.suggestedAction}
                </div>
              </div>
          )}
          </div>
        </div>
      }

      {!isLoading && !forecasts &&
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{t("pharmacy.run_ai_forecast_to_view_predictions")}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{t("pharmacy.click_the_button_above_to_analyse_inventory_with_gemini_ai")}</p>
        </div>
      }
    </div>);

}