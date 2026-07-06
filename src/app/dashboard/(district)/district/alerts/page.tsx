'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictAlerts } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import { AlertTriangle, ShieldCheck, Flame, PowerOff, Users, Siren } from 'lucide-react';

export default function DistrictAlertsPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: alerts, isLoading } = useDistrictAlerts(districtId);

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const list = alerts || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.district_critical_health_alerts")}
        description={t("district.verify_active_clinical_emergencies_power_supplyequipment_anomalies_and_resource_deficits")} />
      

      <div className="grid gap-6 md:grid-cols-2">
        {list.length === 0 ?
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("district.all_systems_normal")}</p>
            <p className="text-xs text-slate-450 mt-1">{t("district.no_critical_facility_operational_warnings_active_today")}</p>
          </div> :

        list.map((item) => {
          const isCritical = item.severity === 'critical';
          return (
            <div
              key={item.alertId}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-850 dark:bg-slate-900 flex flex-col justify-between gap-4">
              
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{item.hospitalName}</h4>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mt-1 ${
                    isCritical ? 'bg-red-50 text-red-650' : 'bg-amber-50 text-amber-650'}`
                    }>
                        {item.severity}{t("district.warning")}
                    </span>
                    </div>

                    {/* Icon selector */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                      {item.type === 'over_capacity' && <Flame className="h-5 w-5 text-red-500" />}
                      {item.type === 'medicine_shortage' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                      {item.type === 'equipment_failure' && <PowerOff className="h-5 w-5 text-slate-500" />}
                      {item.type === 'doctor_shortage' && <Users className="h-5 w-5 text-purple-500" />}
                      {item.type === 'emergency_cases' && <Siren className="h-5 w-5 text-indigo-500 animate-pulse" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    {item.message}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-3 text-[9px] text-slate-400 font-bold flex justify-between">
                  <span>{t("district.logged_at")}{new Date(item.timestamp).toLocaleTimeString()}</span>
                  <span className="text-blue-500 cursor-pointer">{t("district.dispatch_emergency_route")}</span>
                </div>
              </div>);

        })
        }
      </div>
    </div>);

}