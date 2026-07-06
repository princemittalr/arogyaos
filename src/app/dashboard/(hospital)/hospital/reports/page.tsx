'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { PageHeader } from '@/features/shared';
import { FileText, Download, TrendingUp, BarChart2, Clipboard } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {const { t } = useLanguage();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDept, setSelectedDept] = useState('all');

  const handleExport = (format: 'pdf' | 'csv' | 'xlsx') => {
    toast.success(`Exporting ${reportType} report as ${format.toUpperCase()}... Check your downloads folder.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.analytics_reports")}
        description={t("hospital.inspect_medical_department_performance_stats_track_stock_procurement_reports_and_generate_audit_summaries")} />
      

      {/* Selector controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
          className="rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
          
          <option value="daily">{t("hospital.daily_overview")}</option>
          <option value="weekly">{t("hospital.weekly_summary")}</option>
          <option value="monthly">{t("hospital.monthly_audit")}</option>
        </select>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
          
          <option value="all">{t("hospital.all_departments")}</option>
          <option value="cardiology">{t("hospital.cardiology")}</option>
          <option value="neurology">{t("hospital.neurology")}</option>
          <option value="pediatrics">{t("hospital.pediatrics")}</option>
        </select>
      </div>

      {/* Reports metrics layout */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.patient_volume")}</span>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">1,240</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">{t("hospital.14_increase_vs_last_period")}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.bed_occupancy_mean")}</span>
            <BarChart2 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">78%</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">{t("hospital.average_ward_utilization_rate")}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.pharmacy_restocks")}</span>
            <Clipboard className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">310</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">{t("hospital.procured_medicine_items")}</p>
        </div>
      </div>

      {/* Available Documents */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-6">{t("hospital.generated_reports")}</h3>
        <div className="space-y-3.5">
          {[
          { title: t("hospital.clinical_bed_occupancy_trend_audit"), size: '1.2 MB', date: '2026-07-05' },
          { title: t("hospital.department_consultation_performance_registry"), size: '890 KB', date: '2026-07-04' },
          { title: t("hospital.pharmacy_stock_level_deficiency_report"), size: '420 KB', date: '2026-07-01' }].
          map((rep, idx) =>
          <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 transition">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{rep.title}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{t("hospital.generated")}{rep.date}{t("hospital.file_size")}{rep.size}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                onClick={() => handleExport('pdf')}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1">
                
                  <Download className="h-3 w-3" />{t("hospital.pdf")}
              </button>
                <button
                onClick={() => handleExport('csv')}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1">
                
                  <Download className="h-3 w-3" />{t("hospital.csv")}
              </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}