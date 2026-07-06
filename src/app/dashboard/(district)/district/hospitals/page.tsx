'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictFacilities } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';


export default function DistrictHospitalsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: facilities, isLoading } = useDistrictFacilities(districtId);

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const list = (facilities || []).filter((f) => f.type === 'hospital');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.district_hospitals_registry")}
        description={t("district.monitor_general_and_tertiary_hospital_nodes_within_the_district_auditing_available_capacities")} />
      

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900">
        <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700 dark:text-slate-350">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-450 text-[10px] uppercase font-bold">
              <th className="p-4">{t("district.hospital_name")}</th>
              <th className="p-4">{t("district.health_score")}</th>
              <th className="p-4">{t("district.live_bed_occupancy")}</th>
              <th className="p-4">{t("district.doctors_present")}</th>
              <th className="p-4">{t("district.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {list.map((h) => {
              const bedOccupancy = Math.round((h.bedsTotal - h.bedsAvailable) / h.bedsTotal * 100);
              return (
                <tr key={h.facilityId} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{h.name}</p>
                    <p className="text-[9px] text-slate-400">{t("district.node_id")}{h.facilityId}</p>
                  </td>
                  <td className="p-4 text-slate-900 dark:text-slate-55 font-bold">{h.healthScore}%</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{bedOccupancy}% ({h.bedsTotal - h.bedsAvailable}/{h.bedsTotal})</span>
                      <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${bedOccupancy}%` }} className="h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{h.doctorsPresent} / {h.doctorsTotal}{t("district.doctors")}</td>
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