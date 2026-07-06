'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { PageHeader } from '@/features/shared';
import { Layers, AlertTriangle, Battery, ArrowRight, Compass } from 'lucide-react';

const mockLowStock = [
{ name: 'Metformin 500mg', facility: 'West Block CHC', current: 0, min: 300, status: 'depleted' },
{ name: 'Amoxicillin 500mg', facility: 'Metro PHC Center', current: 15, min: 100, status: 'critical' },
{ name: 'Paracetamol 650mg', facility: 'West Block CHC', current: 180, min: 500, status: 'low' },
{ name: 'Azithromycin 500mg', facility: 'East District PHC', current: 8, min: 50, status: 'critical' }];


const mockTopConsumed = [
{ name: 'Paracetamol 650mg', category: 'Analgesics', consumption: '14,500 units/mo' },
{ name: 'Pantoprazole 40mg', category: 'Gastrointestinal', consumption: '8,200 units/mo' },
{ name: 'Amoxicillin 500mg', category: 'Antibiotics', consumption: '5,100 units/mo' }];


export default function DistrictMedicineMonitoringPage() {const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.district_medicine_inventory_monitoring")}
        description={t("district.heatmap_tracking_stock_shortages_active_allocations_and_replenishment_predictions")} />
      

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heatmap Grid representation */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <Layers className="h-4.5 w-4.5 text-blue-500" />{t("district.district_inventory_stock_density")}
          </h3>

          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: 25 }).map((_, idx) => {
              // Mock density statuses
              const density = idx % 7 === 0 ? 'depleted' : idx % 5 === 0 ? 'critical' : idx % 3 === 0 ? 'alert' : 'healthy';
              let colorClass = 'bg-emerald-500';
              if (density === 'depleted') colorClass = 'bg-red-650';
              if (density === 'critical') colorClass = 'bg-red-500';
              if (density === 'alert') colorClass = 'bg-amber-500';

              return (
                <div
                  key={idx}
                  className={`h-12 rounded-xl ${colorClass} flex flex-col justify-end p-1.5 text-white shadow-sm transition hover:scale-105 duration-200 cursor-pointer`}>
                  
                  <span className="text-[7px] font-black tracking-widest uppercase">{t("district.grid")}{idx + 101}</span>
                </div>);

            })}
          </div>

          <div className="flex gap-4 text-[9px] font-bold text-slate-500 pt-2 justify-end">
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-emerald-500" />{t("district.healthy_80")}</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-amber-500" />{t("district.warning_30_80")}</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-red-500" />{t("district.critical_10_30")}</div>
            <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-red-650" />{t("district.depleted_0")}</div>
          </div>
        </div>

        {/* Top Consumed Medicines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <Battery className="h-4.5 w-4.5 text-emerald-500" />{t("district.top_consumed_formulations")}
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
            {mockTopConsumed.map((med, idx) =>
            <div key={idx} className="py-3 flex justify-between items-center font-bold text-slate-800 dark:text-slate-150">
                <div className="space-y-0.5">
                  <p className="text-slate-900 dark:text-slate-50">{med.name}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{med.category}</p>
                </div>
                <span className="text-[10px] text-emerald-650 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-extrabold">
                  {med.consumption}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Low and Out of Stock Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500" />{t("district.alert_triggered_shortages")}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-350">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-850 text-[10px] text-slate-400 font-bold uppercase">
                  <th className="pb-2">{t("district.medicine")}</th>
                  <th className="pb-2">{t("district.location_node")}</th>
                  <th className="pb-2 text-center">{t("district.available")}</th>
                  <th className="pb-2 text-right">{t("district.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {mockLowStock.map((item, idx) =>
                <tr key={idx} className="hover:bg-slate-50/20">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-slate-50">{item.name}</td>
                    <td className="py-2.5 text-slate-400">{item.facility}</td>
                    <td className="py-2.5 text-center">{item.current}{t("district.units")}</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${
                    item.status === 'depleted' ? 'bg-red-100 text-red-750' : item.status === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`
                    }>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Shortage Predictions Placeholder */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
            <Compass className="h-4.5 w-4.5 text-purple-500" />{t("district.ai_stock_replenishment_forecasts")}
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/10 dark:border-purple-900/20 dark:bg-purple-950/5 space-y-1">
              <h4 className="font-bold text-xs text-purple-800 dark:text-purple-400">{t("district.west_block_chc_shortage_warning")}</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{t("district.predictive_ai_indicates_94_chance_of_oral_suspension_antibiotics_going_stock_out_by_wednesday_evening_due_to_localized_monsoonal_viral_shifts")}

              </p>
              <div className="flex gap-2 items-center text-[9px] font-bold text-purple-650 mt-2 cursor-pointer">
                <span>{t("district.configure_auto_redistribution_route")}</span> <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/10 dark:border-indigo-900/20 dark:bg-indigo-950/5 space-y-1">
              <h4 className="font-bold text-xs text-indigo-800 dark:text-indigo-400">{t("district.metro_phc_center_insulin_forecast")}</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{t("district.predictive_ai_forecasts_consistent_consumption_shifts_safety_stock_parameters_should_be_adjusted_up_by_15_starting_next_cycle")}

              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}