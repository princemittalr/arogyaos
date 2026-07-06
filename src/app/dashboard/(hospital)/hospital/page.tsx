'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import {
  useHospitalProfile,
  useHospitalDoctors,
  useHospitalBeds,
  useHospitalInventory,
  useHospitalAppointments } from
'@/features/hospital/hooks/useHospital';
import { LoadingState } from '@/features/shared';
import { motion } from 'framer-motion';
import {
  Users, Bed, AlertTriangle, TrendingUp, TrendingDown,
  UserCheck, ArrowRight, Bot, Building, Package, Activity,
  CheckCircle2, Clock } from
'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const MetricCard = ({
  label, value, sub, icon: Icon, variant = 'default', trend, href




}: {label: string;value: string | number;sub?: string;icon: React.ElementType;variant?: 'default' | 'success' | 'warning' | 'danger';trend?: {value: number;up: boolean;};href?: string;}) => {
  const variants = {
    default: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
  };
  const card =
  <div className={cn('rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 transition-all duration-200', href && 'hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700')}>
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2', variants[variant])}>
          <Icon className="h-4 w-4" />
        </div>
        {trend &&
      <div className={cn('flex items-center gap-1 text-[11px] font-semibold', trend.up ? 'text-emerald-600' : 'text-red-500')}>
            {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}%
          </div>
      }
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>;

  return href ? <Link href={href}>{card}</Link> : card;
};

export default function HospitalDashboardPage() {const { t } = useLanguage();
  const ALERTS = [
  { level: 'critical', title: t("hospital.amoxicillin_500mg_critical_stock"), desc: 'Only 85 units remaining. Below minimum threshold.', time: '10m ago' },
  { level: 'warning', title: t("hospital.icu_capacity_notice"), desc: 'Ward Room 101 has only 2 vacant beds remaining.', time: '45m ago' },
  { level: 'info', title: t("hospital.lab_report_ready"), desc: 'CBC results for Patient #4821 are ready for review.', time: '1h ago' }];


  const AI_INSIGHTS = [
  { text: t("hospital.bed_occupancy_likely_to_exceed_85_tonight_based_on_current_admission_rate"), confidence: 91, priority: 'High' },
  { text: t("hospital.recommend_requesting_200_units_of_paracetamol_iv_from_district_supply_chain"), confidence: 87, priority: 'Medium' },
  { text: t("hospital.dr_verma_has_3_uncompleted_discharge_summaries_pending_from_yesterday"), confidence: 95, priority: 'High' }];

  const hospitalId = 'hosp_city_gen';

  const { data: profile, isLoading: profileLoading } = useHospitalProfile(hospitalId);
  const { data: doctors, isLoading: docsLoading } = useHospitalDoctors(hospitalId);
  const { data: beds, isLoading: bedsLoading } = useHospitalBeds(hospitalId);
  const { data: inventory, isLoading: invLoading } = useHospitalInventory(hospitalId);
  const { data: appointments, isLoading: apptsLoading } = useHospitalAppointments(hospitalId);

  if (profileLoading || docsLoading || bedsLoading || invLoading || apptsLoading) {
    return <LoadingState variant="card" />;
  }

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayApptStr = today.toISOString().split('T')[0];

  const activeDocCount = doctors?.filter((d) => d.attendanceStatus === 'present').length || 0;
  const totalBeds = beds?.length || 0;
  const occupiedBeds = beds?.filter((b) => b.status === 'occupied').length || 0;
  const occupancyPct = totalBeds > 0 ? Math.round(occupiedBeds / totalBeds * 100) : 0;
  const lowStockCount = inventory?.filter((i) => i.status === 'low_stock' || i.status === 'expired').length || 0;
  const todayAppts = appointments?.filter((a) => a.appointmentDate === todayApptStr) || [];
  const pendingAppts = todayAppts.filter((a) => a.status === 'scheduled');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {profile?.hospitalName || 'City General Hospital'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr}{t("hospital.operational_hub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/hospital/reports" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Activity className="h-3.5 w-3.5" />{t("hospital.reports")}
          </Link>
          <Link href="/dashboard/hospital/ai-health-score" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm">
            <Bot className="h-3.5 w-3.5" />{t("hospital.ai_insights")}
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label={t("hospital.doctors_on_duty")} value={`${activeDocCount}/${doctors?.length || 0}`} sub={t("hospital.staff_present")} icon={UserCheck} variant="success" trend={{ value: 5, up: true }} href="/dashboard/hospital/doctors" />
        <MetricCard label={t("hospital.bed_occupancy")} value={`${occupancyPct}%`} sub={`${occupiedBeds} of ${totalBeds} beds`} icon={Bed} variant={occupancyPct > 80 ? 'danger' : occupancyPct > 60 ? 'warning' : 'default'} href="/dashboard/hospital/beds" />
        <MetricCard label={t("hospital.todays_appointments")} value={todayAppts.length} sub={`${pendingAppts.length} pending`} icon={Clock} variant="default" href="/dashboard/hospital/appointments" />
        <MetricCard label={t("hospital.inventory_alerts")} value={lowStockCount} sub={t("hospital.lowexpired_items")} icon={AlertTriangle} variant={lowStockCount > 0 ? 'danger' : 'success'} href="/dashboard/hospital/inventory" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Today's Queue */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("hospital.todays_appointment_queue")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{pendingAppts.length}{t("hospital.pending")}{todayAppts.filter((a) => a.status === 'completed').length}{t("hospital.completed")}</p>
              </div>
              <Link href="/dashboard/hospital/appointments" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("hospital.view_all")}

              </Link>
            </div>
            {todayAppts.length === 0 ?
            <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-300 mb-2" />
                <p className="text-xs font-medium text-slate-500">{t("hospital.no_appointments_scheduled_for_today")}</p>
              </div> :

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayAppts.slice(0, 5).map((appt) =>
              <div key={appt.appointmentId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                        #{appt.tokenNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{doctors?.find((d) => d.uid === appt.doctorId)?.doctorName || 'Doctor'}</p>
                        <p className="text-[11px] text-slate-400">{appt.appointmentTime}</p>
                      </div>
                    </div>
                    <span className={cn('flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold capitalize',
                appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                appt.status === 'checked_in' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )}>
                      {appt.status.replace('_', ' ')}
                    </span>
                  </div>
              )}
              </div>
            }
          </div>

          {/* Quick Access Grid */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{t("hospital.quick_access")}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[
              { label: t("hospital.departments"), icon: Building, href: '/dashboard/hospital/departments' },
              { label: t("hospital.doctors"), icon: Users, href: '/dashboard/hospital/doctors' },
              { label: t("hospital.patients"), icon: UserCheck, href: '/dashboard/hospital/patients' },
              { label: t("hospital.beds"), icon: Bed, href: '/dashboard/hospital/beds' },
              { label: t("hospital.inventory"), icon: Package, href: '/dashboard/hospital/inventory' },
              { label: t("hospital.lab"), icon: Activity, href: '/dashboard/hospital/laboratory' },
              { label: t("hospital.pharmacy"), icon: Package, href: '/dashboard/hospital/pharmacy' },
              { label: t("hospital.reports"), icon: Activity, href: '/dashboard/hospital/reports' }].
              map((item) =>
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition">
                
                  <item.icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* Critical Alerts */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("hospital.priority_alerts")}</h2>
            </div>
            <div className="space-y-3">
              {ALERTS.map((alert, i) =>
              <div key={i} className={cn('rounded-lg p-3',
              alert.level === 'critical' ? 'bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30' :
              alert.level === 'warning' ? 'bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30' :
              'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50'
              )}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-[11px] font-semibold',
                  alert.level === 'critical' ? 'text-red-700 dark:text-red-400' :
                  alert.level === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                  'text-slate-700 dark:text-slate-300'
                  )}>
                      {alert.title}
                    </p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{alert.desc}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t("hospital.ai_recommendations")}</h2>
              </div>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">{t("hospital.gemini")}</span>
            </div>
            <div className="space-y-3">
              {AI_INSIGHTS.map((insight, i) =>
              <div key={i} className="rounded-lg bg-white/70 dark:bg-slate-900/50 p-3 border border-white/80 dark:border-slate-800/50">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold uppercase',
                  insight.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                  )}>
                      {insight.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{insight.confidence}{t("hospital.confidence")}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{insight.text}</p>
                </div>
              )}
            </div>
            <Link href="/dashboard/hospital/ai-health-score" className="mt-4 flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("hospital.full_ai_analysis")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>);

}