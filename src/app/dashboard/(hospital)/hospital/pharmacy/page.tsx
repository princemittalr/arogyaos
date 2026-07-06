'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useHospitalInventory } from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { AlertTriangle, AlertCircle, ShoppingBag, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PharmacyOverviewPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: inventory, isLoading } = useHospitalInventory(hospitalId);

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  // Telemetry
  const totalMedicines = inventory?.length || 0;
  const lowStockItems = inventory?.filter((i) => i.status === 'low_stock') || [];
  const expiredItems = inventory?.filter((i) => i.status === 'expired') || [];

  // Inventory Health Rating
  const inventoryHealth = totalMedicines > 0 ? Math.round((totalMedicines - lowStockItems.length - expiredItems.length) / totalMedicines * 100) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.pharmacy_hub")}
        description={t("hospital.inspect_medical_stock_thresholds_check_expiration_dateline_warnings_and_optimize_critical_quotas")} />
      

      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.inventory_health")}</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{inventoryHealth}%</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{t("hospital.weighted_catalog_compliance")}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.total_formulas")}</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{totalMedicines}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{t("hospital.unique_medicine_units")}</span>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/10 p-6 dark:border-red-950/20 dark:bg-slate-900">
          <span className="text-xs text-red-650 dark:text-red-400 font-bold uppercase tracking-wider">{t("hospital.low_stock_alerts")}</span>
          <p className="text-3xl font-extrabold text-red-650 dark:text-red-400 mt-1">{lowStockItems.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{t("hospital.below_target_reserve_minimum")}</span>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/10 p-6 dark:border-orange-950/20 dark:bg-slate-900">
          <span className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">{t("hospital.expired_formulas")}</span>
          <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-1">{expiredItems.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{t("hospital.requiring_active_disposal")}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Low Stock Alerts & Expirations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Warnings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>{t("hospital.critical_refill_warnings")}</span>
            </h3>

            {lowStockItems.length === 0 ?
            <p className="text-xs text-slate-500 py-4 text-center">{t("hospital.no_current_low_stock_warnings")}</p> :

            <div className="space-y-3">
                {lowStockItems.map((item) =>
              <div key={item.inventoryId} className="flex justify-between items-center bg-red-50/10 border border-red-100/30 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-250">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{t("hospital.min_stock_threshold")}{item.minimumStock}{t("hospital.supplier")}{item.supplier}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-red-650 dark:text-red-400">{item.quantity}{t("hospital.units")}</span>
                      <span className="text-[9px] text-slate-400 font-bold">{t("hospital.action_needed")}</span>
                    </div>
                  </div>
              )}
              </div>
            }
          </div>

          {/* Expiration List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-1.5">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>{t("hospital.expiration_safety_registry")}</span>
            </h3>

            {expiredItems.length === 0 ?
            <p className="text-xs text-slate-500 py-4 text-center">{t("hospital.no_active_formulas_have_expired")}</p> :

            <div className="space-y-3">
                {expiredItems.map((item) =>
              <div key={item.inventoryId} className="flex justify-between items-center bg-orange-50/10 border border-orange-100/30 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-250">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{t("hospital.expired_on")}{item.expiryDate as string}</p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[9px] font-extrabold text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">{t("hospital.disposal_pending")}

                </span>
                  </div>
              )}
              </div>
            }
          </div>
        </div>

        {/* Quick Actions & Sync */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4">{t("hospital.stock_control_actions")}</h3>
            <div className="space-y-3">
              <Link href="/dashboard/hospital/inventory" className="flex items-center gap-3 rounded-xl border border-slate-150 p-3.5 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-850 transition">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{t("hospital.inventory_ledger")}</p>
                  <p className="text-[9px] text-slate-500">{t("hospital.add_or_edit_formula_catalog_items")}</p>
                </div>
              </Link>
              <div className="flex items-center gap-3 rounded-xl border border-slate-150 p-3.5 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-850 cursor-pointer transition">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{t("hospital.bulk_procurement")}</p>
                  <p className="text-[9px] text-slate-500">{t("hospital.draft_supplier_request_order_bills")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-150 p-3.5 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-850 cursor-pointer transition">
                <Sparkles className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250">{t("hospital.gemini_audit_optimizer")}</p>
                  <p className="text-[9px] text-slate-500">{t("hospital.predict_quarterly_consumption_patterns")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}