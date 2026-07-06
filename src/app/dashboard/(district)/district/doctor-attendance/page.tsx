'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictDoctorAttendance } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import { CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';

const AttendanceTrendChart = dynamic(() => import('@/features/shared/charts/AttendanceTrendChart'), {
  ssr: false,
  loading: () => <div className="h-60 w-full bg-slate-50 dark:bg-slate-950 animate-pulse rounded-lg" />
});

const mockAttendanceTrends = [
{ name: 'Monday', present: 88 },
{ name: 'Tuesday', present: 92 },
{ name: 'Wednesday', present: 85 },
{ name: 'Thursday', present: 94 },
{ name: 'Friday', present: 89 },
{ name: 'Saturday', present: 78 },
{ name: 'Sunday', present: 74 }];


export default function DistrictDoctorAttendancePage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: attendance, isLoading } = useDistrictDoctorAttendance(districtId);

  if (isLoading) {
    return <LoadingState variant="chart" />;
  }

  const stats = attendance || {
    present: 0,
    absent: 0,
    onLeave: 0,
    departments: []
  };

  const totalStaff = stats.present + stats.absent + stats.onLeave;
  const attendanceRate = totalStaff ? Math.round(stats.present / totalStaff * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.doctor_attendance_duty_logs")}
        description={t("district.verify_active_clinical_duty_rotas_department_presence_parameters_and_weekly_logs")} />
      

      {/* Top row metrics cards */}
      <div className="grid gap-4 md:grid-cols-4 text-xs font-bold">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">{t("district.attendance_ratio")}</p>
          <p className="text-2xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-50">{attendanceRate}%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">{t("district.on_duty_doctors")}</p>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mt-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-2xl font-extrabold">{stats.present}{t("district.present")}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">{t("district.absent_doctors")}</p>
          <div className="flex items-center gap-1.5 text-red-500 mt-1.5">
            <AlertCircle className="h-5 w-5" />
            <span className="text-2xl font-extrabold">{stats.absent}{t("district.absent")}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">{t("district.on_leave")}</p>
          <div className="flex items-center gap-1.5 text-amber-500 mt-1.5">
            <Calendar className="h-5 w-5" />
            <span className="text-2xl font-extrabold">{stats.onLeave}{t("district.leave")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Breakdowns */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.department_wise_clinical_roster")}

          </h3>

          <div className="space-y-3.5 text-xs font-bold text-slate-700 dark:text-slate-350">
            {stats.departments.map((dept, idx) => {
              const pct = dept.total ? Math.round(dept.present / dept.total * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-850 dark:text-slate-100">
                    <span>{dept.name}</span>
                    <span>{dept.present} / {dept.total}{t("district.present")}{pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-blue-500 rounded-full" />
                  </div>
                </div>);

            })}
          </div>
        </div>

        {/* Weekly Attendance trends chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.clinical_duty_presence_timeline")}

          </h3>

          <div className="h-60">
            <AttendanceTrendChart data={mockAttendanceTrends} />
          </div>
        </div>
      </div>
    </div>);

}