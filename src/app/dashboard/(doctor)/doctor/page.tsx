'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useDoctorProfile,
  useDoctorQueue,
  useDoctorFollowUps } from
'@/features/doctor/hooks/useDoctor';
import { LoadingState } from '@/features/shared';
import {
  Users, Calendar, FileText, Clock, Bot, ArrowRight,
  CheckCircle2, AlertCircle, Play, TrendingUp } from
'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function DoctorDashboardPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || 'doc_arav_mehta';

  const { data: profile, isLoading: profileLoading } = useDoctorProfile(uid);
  const { data: queue, isLoading: queueLoading } = useDoctorQueue(uid);
  const { data: followUps, isLoading: followUpsLoading } = useDoctorFollowUps(uid);

  if (profileLoading || queueLoading || followUpsLoading) {
    return <LoadingState variant="table" />;
  }

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  const todayQueue = queue || [];
  const completed = todayQueue.filter((a) => a.status === 'completed').length;
  const pending = todayQueue.filter((a) => a.status === 'scheduled' || a.status === 'checked_in').length;
  const inProgress = todayQueue.find((a) => a.status === 'checked_in');
  const nextPatient = inProgress || todayQueue.find((a) => a.status === 'scheduled');
  const dueFollowUps = followUps?.filter((f) => f.status === 'upcoming') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t("doctor.good")}
            {today.getHours() < 12 ? 'morning' : 'afternoon'}{t("doctor.dr")}{profile?.fullName?.split(' ').pop() || user?.fullName?.split(' ').pop() || 'Doctor'} 👨‍⚕️
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr}</p>
        </div>
        {nextPatient &&
        <Link
          href={`/dashboard/doctor/consultation/${nextPatient.appointmentId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/20">
          
            <Play className="h-4 w-4 fill-current" />
            {inProgress ? 'Resume Consultation' : 'Start Next Patient'}
          </Link>
        }
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
        { label: t("doctor.todays_queue"), value: todayQueue.length, sub: t("doctor.total_patients"), icon: Users, color: 'blue', href: '/dashboard/doctor/patients' },
        { label: t("doctor.completed"), value: completed, sub: t("doctor.consultations_done"), icon: CheckCircle2, color: 'emerald', href: null },
        { label: t("doctor.pending"), value: pending, sub: t("doctor.waiting_in_queue"), icon: Clock, color: pending > 5 ? 'red' : 'amber', href: null },
        { label: t("doctor.follow_ups_due"), value: dueFollowUps.length, sub: t("doctor.this_week"), icon: TrendingUp, color: dueFollowUps.length > 0 ? 'purple' : 'default', href: '/dashboard/doctor/follow-ups' }].
        map((kpi, i) => {
          const colors: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
            red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
            default: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          };
          const card =
          <div className={cn('rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 transition-all', kpi.href && 'hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700 cursor-pointer')}>
              <div className={cn('inline-flex rounded-lg p-2', colors[kpi.color])}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
            </div>;

          return kpi.href ? <Link key={i} href={kpi.href}>{card}</Link> : <div key={i}>{card}</div>;
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols: Queue */}
        <div className="lg:col-span-2 space-y-6">

          {/* Patient Queue */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("doctor.todays_patient_queue")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{completed}{t("doctor.done")}{pending}{t("doctor.remaining")}</p>
              </div>
              <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                {today.toISOString().split('T')[0]}
              </span>
            </div>

            {todayQueue.length === 0 ?
            <div className="flex flex-col items-center py-12 text-center">
                <AlertCircle className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-500">{t("doctor.no_consultations_scheduled")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("doctor.your_patient_queue_will_appear_here")}</p>
              </div> :

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayQueue.map((appt) =>
              <div key={appt.appointmentId} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  appt.status === 'checked_in' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                  appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  )}>
                        #{appt.tokenNumber}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/dashboard/doctor/patient/${appt.patientId}`} className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition truncate block">
                          {appt.patientName}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {appt.patientAge}{t("doctor.y")}{appt.patientGender} · {appt.appointmentTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('rounded-md px-2 py-1 text-[10px] font-semibold capitalize',
                  appt.status === 'checked_in' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                  appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}>
                        {appt.status.replace('_', ' ')}
                      </span>
                      {appt.status !== 'completed' &&
                  <Link
                    href={`/dashboard/doctor/consultation/${appt.appointmentId}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-3 py-1.5 text-[10px] font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition">{t("doctor.consult")}

                    <ArrowRight className="h-3 w-3" />
                        </Link>
                  }
                    </div>
                  </div>
              )}
              </div>
            }
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{t("doctor.quick_access")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
              { label: t("doctor.patients"), icon: Users, href: '/dashboard/doctor/patients', color: 'text-blue-600' },
              { label: t("doctor.prescriptions"), icon: FileText, href: '/dashboard/doctor/prescriptions', color: 'text-emerald-600' },
              { label: t("doctor.lab_orders"), icon: AlertCircle, href: '/dashboard/doctor/lab-orders', color: 'text-indigo-600' },
              { label: t("doctor.follow_ups"), icon: Calendar, href: '/dashboard/doctor/follow-ups', color: 'text-amber-600' }].
              map((item) =>
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition">
                
                  <item.icon className={cn('h-5 w-5', item.color)} />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Next Patient Card */}
          {nextPatient &&
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {inProgress ? 'Current Patient' : 'Next Patient'}
                </h2>
                <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold',
              inProgress ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
              )}>
                  {inProgress ? 'In Progress' : 'Up Next'}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {nextPatient.patientName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{nextPatient.patientName}</p>
                    <p className="text-[11px] text-slate-400">{nextPatient.patientAge}{t("doctor.y")}{nextPatient.patientGender}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 grid grid-cols-3 gap-1 p-3 text-center">
                  {[['BP', '120/80'], ['HR', '72 bpm'], ['Temp', '98.6°F']].map(([k, v]) =>
                <div key={k}>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">{k}</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{v}</p>
                    </div>
                )}
                </div>
                {nextPatient.patientAllergies && nextPatient.patientAllergies.length > 0 &&
              <div className="rounded-lg bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 px-3 py-2">
                    <p className="text-[10px] font-semibold text-red-600 dark:text-red-400">{t("doctor.allergies")}
                  {nextPatient.patientAllergies.join(', ')}
                    </p>
                  </div>
              }
                <Link
                href={`/dashboard/doctor/consultation/${nextPatient.appointmentId}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                
                  <Play className="h-4 w-4 fill-current" />{t("doctor.open_case_file")}
              </Link>
              </div>
            </div>
          }

          {/* AI Assistant */}
          <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t("doctor.ai_clinical_briefing")}</h2>
              </div>
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400">{t("doctor.gemini")}</span>
            </div>
            <div className="rounded-lg bg-white/70 dark:bg-slate-900/50 p-3.5 border border-white dark:border-slate-800/50">
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{t("doctor.todays_queue_features_elevated_cardiac_monitoring_priority_patient_rohan_sharma_shows_borderline_hypertension_13085_mmhg_review_lipid_profiles_before_consultation")}

              </p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{t("doctor.91_confidence")}</span>
              <Link href="/dashboard/doctor/ai-summary" className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">{t("doctor.full_ai_summary")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Follow-ups */}
          {dueFollowUps.length > 0 &&
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("doctor.follow_ups_due")}</h2>
                <Link href="/dashboard/doctor/follow-ups" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("doctor.see_all")}

              </Link>
              </div>
              <div className="space-y-2.5">
                {dueFollowUps.slice(0, 3).map((f) =>
              <div key={f.followUpId} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                      <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{f.patientName}</p>
                      <p className="text-[10px] text-slate-400">{f.followUpDate} · {f.notes || 'Routine Checkup'}</p>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }
        </div>
      </div>
    </motion.div>);

}