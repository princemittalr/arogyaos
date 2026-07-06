'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictFacilities } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';

export default function DistrictCHCsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: facilities, isLoading } = useDistrictFacilities(districtId);

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const list = (facilities || []).filter((f) => f.type === 'chc');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.community_health_centers_chcs")}
        description={t("district.audit_secondary_medical_units_and_localized_clinics_supporting_urban_blocks")} />
      

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900">
        <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700 dark:text-slate-350">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-450 text-[10px] uppercase font-bold">
              <th className="p-4">{t("district.chc_center_name")}</th>
              <th className="p-4">{t("district.health_score")}</th>
              <th className="p-4">{t("district.beds_available")}</th>
              <th className="p-4">{t("district.staff_present")}</th>
              <th className="p-4">{t("district.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {list.map((h) => {
              return (
                <tr key={h.facilityId} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{h.name}</p>
                    <p className="text-[9px] text-slate-400">{t("district.node_id")}{h.facilityId}</p>
                  </td>
                  <td className="p-4 text-slate-900 dark:text-slate-55 font-bold">{h.healthScore}%</td>
                  <td className="p-4">{h.bedsAvailable} / {h.bedsTotal}{t("district.beds")}</td>
                  <td className="p-4">{h.doctorsPresent} / {h.doctorsTotal}{t("district.practitioners")}</td>
                  <td className="p-4">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                    h.status === 'green' ? 'bg-emerald-500' : h.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`
                    } />
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}