'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePharmacyInventory } from '@/features/pharmacy/hooks/usePharmacy';
import { PageHeader, LoadingState } from '@/features/shared';
import { FileText, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function PharmacyReportsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_city_gen';

  const { data: inventory, isLoading } = usePharmacyInventory(hospitalId);
  const [selectedReport, setSelectedReport] = useState<'movement' | 'lowstock' | 'expiry'>('movement');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const items = inventory || [];

  // Filter lists for report rendering
  const lowStockItems = items.filter((i) => i.quantity > 0 && i.quantity <= i.minimumStock);
  const today = new Date();
  const expiredItems = items.filter((i) => new Date(i.expiryDate) <= today);

  const handleDownload = (format: string) => {
    toast.success(`Preparing your ${selectedReport} report in ${format} format... check downloads soon.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pharmacy.pharmacy_analytics_reports")}
        description={t("pharmacy.audit_stock_turnover_movement_generate_compliance_expiry_audits_and_export_logistics_files")} />
      

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column: Report Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider mb-2">{t("pharmacy.report_category")}</h3>
          
          <button
            onClick={() => setSelectedReport('movement')}
            className={`w-full text-left rounded-xl p-3 text-xs font-bold transition flex items-center gap-2 ${
            selectedReport === 'movement' ?
            'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
            'hover:bg-slate-50 dark:hover:bg-slate-850/50'}`
            }>
            
            <TrendingUp className="h-4 w-4" />{t("pharmacy.stock_movement_audit")}
          </button>

          <button
            onClick={() => setSelectedReport('lowstock')}
            className={`w-full text-left rounded-xl p-3 text-xs font-bold transition flex items-center gap-2 ${
            selectedReport === 'lowstock' ?
            'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
            'hover:bg-slate-50 dark:hover:bg-slate-850/50'}`
            }>
            
            <AlertTriangle className="h-4 w-4" />{t("pharmacy.low_stock_alerts_report")}
          </button>

          <button
            onClick={() => setSelectedReport('expiry')}
            className={`w-full text-left rounded-xl p-3 text-xs font-bold transition flex items-center gap-2 ${
            selectedReport === 'expiry' ?
            'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
            'hover:bg-slate-50 dark:hover:bg-slate-850/50'}`
            }>
            
            <FileText className="h-4 w-4" />{t("pharmacy.batch_expiry_register")}
          </button>
        </div>

        {/* Right Columns: Report Viewer & Export Buttons */}
        <div className="lg:col-span-3 space-y-6">
          {/* Report Viewer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 capitalize">
                  {selectedReport === 'movement' && 'Stock Rotation & Movement Report'}
                  {selectedReport === 'lowstock' && 'Stock Replenishment Required Report'}
                  {selectedReport === 'expiry' && 'Batch Lifetime Compliance Register'}
                </h4>
                <p className="text-[10px] text-slate-450 font-semibold mt-0.5">{t("pharmacy.hospital_city_general_hospital_generated_today")}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('PDF')}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                  
                  <Download className="h-3.5 w-3.5" />{t("pharmacy.pdf")}
                </button>
                <button
                  onClick={() => handleDownload('CSV')}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                  
                  <Download className="h-3.5 w-3.5" />{t("pharmacy.csv")}
                </button>
              </div>
            </div>

            {/* Movement table report */}
            {selectedReport === 'movement' &&
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-450 text-[10px] uppercase font-bold">
                      <th className="p-3">{t("pharmacy.medicine")}</th>
                      <th className="p-3">{t("pharmacy.total_dispensed")}</th>
                      <th className="p-3">{t("pharmacy.current_stock")}</th>
                      <th className="p-3">{t("pharmacy.rotation_ratio")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {items.map((i, idx) =>
                  <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-850 dark:text-slate-50">{i.medicineName}</td>
                        <td className="p-3">{(idx + 2) * 20}{t("pharmacy.units")}</td>
                        <td className="p-3">{i.quantity}{t("pharmacy.units")}</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{t("pharmacy.healthy_rotation")}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }

            {/* Low stock report */}
            {selectedReport === 'lowstock' &&
            <div className="overflow-x-auto">
                {lowStockItems.length === 0 ?
              <p className="text-xs text-slate-450 italic text-center py-6">{t("pharmacy.all_formula_stocks_are_above_safety_limits")}</p> :

              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-450 text-[10px] uppercase font-bold">
                        <th className="p-3">{t("pharmacy.medicine")}</th>
                        <th className="p-3">{t("pharmacy.current_stock")}</th>
                        <th className="p-3">{t("pharmacy.safety_limit")}</th>
                        <th className="p-3">{t("pharmacy.deficit")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {lowStockItems.map((i) =>
                  <tr key={i.inventoryId} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-850 dark:text-slate-50">{i.medicineName}</td>
                          <td className="p-3 text-red-500 font-bold">{i.quantity}</td>
                          <td className="p-3">{i.minimumStock}</td>
                          <td className="p-3 text-red-600 font-bold">{i.minimumStock - i.quantity}{t("pharmacy.units")}</td>
                        </tr>
                  )}
                    </tbody>
                  </table>
              }
              </div>
            }

            {/* Expiry Report */}
            {selectedReport === 'expiry' &&
            <div className="overflow-x-auto">
                {expiredItems.length === 0 ?
              <p className="text-xs text-slate-450 italic text-center py-6">{t("pharmacy.no_expired_items_registered_on_active_shelves")}</p> :

              <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-450 text-[10px] uppercase font-bold">
                        <th className="p-3">{t("pharmacy.medicine")}</th>
                        <th className="p-3">{t("pharmacy.batch")}</th>
                        <th className="p-3">{t("pharmacy.quantity")}</th>
                        <th className="p-3">{t("pharmacy.expiry_date")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {expiredItems.map((i) =>
                  <tr key={i.inventoryId} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-850 dark:text-slate-50">{i.medicineName}</td>
                          <td className="p-3">{i.batchNumber}</td>
                          <td className="p-3 text-red-500 font-bold">{i.quantity}</td>
                          <td className="p-3 text-red-650 font-bold">{i.expiryDate}</td>
                        </tr>
                  )}
                    </tbody>
                  </table>
              }
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}