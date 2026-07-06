'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictBedStats } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers, Activity, Users } from 'lucide-react';

const mockOccupancyTrend = [
{ name: '08:00', occupancy: 72 },
{ name: '10:00', occupancy: 78 },
{ name: '12:00', occupancy: 85 },
{ name: '14:00', occupancy: 82 },
{ name: '16:00', occupancy: 80 },
{ name: '18:00', occupancy: 84 },
{ name: '20:00', occupancy: 86 }];


export default function DistrictBedMonitoringPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: bedStats, isLoading } = useDistrictBedStats(districtId);

  if (isLoading) {
    return <LoadingState variant="chart" />;
  }

  const stats = bedStats || {
    available: 0,
    occupied: 0,
    icu: { available: 0, total: 0 },
    emergency: { available: 0, total: 0 },
    private: { available: 0, total: 0 },
    general: { available: 0, total: 0 }
  };

  const totalBeds = stats.available + stats.occupied;
  const occupancyRate = totalBeds ? Math.round(stats.occupied / totalBeds * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.district_bed_availability_monitor")}
        description={t("district.verify_active_icu_general_ward_and_emergency_capacity_registers_across_health_hubs")} />
      

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">{t("district.occupancy_rate")}</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{occupancyRate}%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">{t("district.total_beds")}</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{totalBeds}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">{t("district.occupied_beds")}</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{stats.occupied}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">{t("district.available_beds")}</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{stats.available}</p>
        </div>
      </div>

      {/* Grid of details and chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ward-wise availability breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.ward_capacity_auditing")}

          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{t("district.icu_beds")}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{t("district.critical_ventilative_support")}</p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-50">
                {stats.icu.available} / {stats.icu.total}{t("district.available")}
              </span>
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{t("district.emergency_beds")}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{t("district.triage_and_trauma_care")}</p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-50">
                {stats.emergency.available} / {stats.emergency.total}{t("district.available")}
              </span>
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{t("district.private_rooms")}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{t("district.single_patient_isolation_setups")}</p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-50">
                {stats.private.available} / {stats.private.total}{t("district.available")}
              </span>
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{t("district.general_ward")}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{t("district.common_clinical_observations")}</p>
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-50">
                {stats.general.available} / {stats.general.total}{t("district.available")}
              </span>
            </div>
          </div>
        </div>

        {/* Occupancy trends chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.district_bed_occupancy_timeline")}

          </h3>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockOccupancyTrend}>
                <defs>
                  <linearGradient id="colorBeds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }} />
                
                <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBeds)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);

}