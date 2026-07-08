'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictFacilities } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import { Download, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function DistrictReportsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: facilities, isLoading } = useDistrictFacilities(districtId);
  const [selectedReport, setSelectedReport] = useState<'summary' | 'rankings'>('summary');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const list = facilities || [];

  // Sort facilities to rank them
  const hospitalRanks = [...list].filter((f) => f.type === 'hospital').sort((a, b) => b.healthScore - a.healthScore);
  const phcRanks = [...list].filter((f) => f.type === 'phc').sort((a, b) => b.healthScore - a.healthScore);
  const chcRanks = [...list].filter((f) => f.type === 'chc').sort((a, b) => b.healthScore - a.healthScore);

  const handleDownload = (format: string) => {
    toast.success(`Preparing your ${selectedReport} document in ${format} format... check downloads directory soon.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.district_executive_reports")}
        description={t("district.audit_district_summary_indicators_facility_rankings_and_export_executive_pdf_registers")} />
      

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Report selection panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="font-extrabold text-[10px] text-slate-450 uppercase tracking-wider mb-2">{t("district.report_type")}</h3>

          <button
            onClick={() => setSelectedReport('summary')}
            className={`w-full text-left rounded-xl p-3 text-xs font-bold transition flex items-center gap-2 ${
            selectedReport === 'summary' ?
            'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
            'hover:bg-slate-50 dark:hover:bg-slate-850/50'}`
            }>
            
            <TrendingUp className="h-4 w-4" />{t("district.district_summary")}
          </button>

          <button
            onClick={() => setSelectedReport('rankings')}
            className={`w-full text-left rounded-xl p-3 text-xs font-bold transition flex items-center gap-2 ${
            selectedReport === 'rankings' ?
            'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
            'hover:bg-slate-50 dark:hover:bg-slate-850/50'}`
            }>
            
            <Award className="h-4 w-4" />{t("district.facility_rankings")}
          </button>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 capitalize">
                  {selectedReport === 'summary' ? 'District Executive Summary Report' : 'Facility Health Performance Rankings'}
                </h4>
                <p className="text-[10px] text-slate-450 font-semibold mt-0.5">{t("district.district_id_central_delhi_live_compilation")}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('PDF')}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                  
                  <Download className="h-3.5 w-3.5" />{t("district.pdf")}
                </button>
                <button
                  onClick={() => handleDownload('CSV')}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1">
                  
                  <Download className="h-3.5 w-3.5" />{t("district.csv")}
                </button>
              </div>
            </div>

            {selectedReport === 'summary' &&
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-50">{t("district.overall_operational_status_stable")}</h5>
                    <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">{t("district.live_audit_parameters_indicate_average_health_scores_across_all_facilities_are_above_warning_thresholds_stock_redistribution_procedures_are_actively_handling_minor_deficits_in_real_time")}

                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-bold text-slate-600">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-850">
                    <p className="text-[9px] text-slate-400">{t("district.total_clinics_monitored")}</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 mt-1">{list.length}{t("district.nodes")}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-850">
                    <p className="text-[9px] text-slate-400">{t("district.active_medical_personnel")}</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                      {list.reduce((acc, f) => acc + f.doctorsPresent, 0)}{t("district.on_duty")}
                  </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-slate-850">
                    <p className="text-[9px] text-slate-400">{t("district.average_patients_count")}</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                      {list.reduce((acc, f) => acc + f.patientsCount, 0)}{t("district.admissions")}
                  </p>
                  </div>
                </div>
              </div>
            }

            {selectedReport === 'rankings' &&
            <div className="space-y-6">
                {/* Hospital ranks */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">{t("district.hospitals_health_rank")}</h5>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {hospitalRanks.map((h, idx) =>
                  <div key={h.facilityId} className="py-2 flex justify-between font-bold text-slate-800 dark:text-slate-300">
                        <span>{idx + 1}. {h.name}</span>
                        <span className="text-blue-500">{h.healthScore}{t("district.health_score")}</span>
                      </div>
                  )}
                  </div>
                </div>

                {/* PHC ranks */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">{t("district.phc_health_rank")}</h5>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {phcRanks.map((p, idx) =>
                  <div key={p.facilityId} className="py-2 flex justify-between font-bold text-slate-800 dark:text-slate-300">
                        <span>{idx + 1}. {p.name}</span>
                        <span className="text-blue-500">{p.healthScore}{t("district.health_score")}</span>
                      </div>
                  )}
                  </div>
                </div>

                {/* CHC ranks */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">{t("district.chc_health_rank")}</h5>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {chcRanks.map((c, idx) =>
                  <div key={c.facilityId} className="py-2 flex justify-between font-bold text-slate-800 dark:text-slate-300">
                        <span>{idx + 1}. {c.name}</span>
                        <span className="text-blue-500">{c.healthScore}{t("district.health_score")}</span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}