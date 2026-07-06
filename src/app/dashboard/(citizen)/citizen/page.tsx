'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCitizenProfile,
  useAppointments,
  usePrescriptions,
  useReports,
  useNotifications,
  useHospitals,
  useFamilyMembers } from
'@/features/citizen/hooks/useCitizen';
import { icons } from '@/design-system/icons';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import Link from 'next/link';

const KPICard = ({
  label, value, sub, icon: Icon, color = 'blue', href



}: {label: string;value: string | number;sub?: string;icon: React.ElementType;color?: string;href?: string;}) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
  };
  const el =
  <div className={cn('group rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 transition-all duration-200', href && 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer')}>
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2', colors[color] || colors.blue)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>;

  return href ? <Link href={href}>{el}</Link> : el;
};

export default function CitizenDashboardPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const uid = user?.uid || '';

  const { data: profile, isLoading: profileLoading } = useCitizenProfile(uid);
  const { data: appointments, isLoading: apptsLoading } = useAppointments(uid);
  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions(uid);
  const { data: reports, isLoading: reportsLoading } = useReports(uid);
  const { data: notifications, isLoading: notifLoading } = useNotifications(uid);
  const { data: hospitals } = useHospitals();
  const { data: family } = useFamilyMembers(uid);

  const isLoading = profileLoading || apptsLoading || rxLoading || reportsLoading || notifLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>);

  }

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const upcomingAppointment = appointments?.
  filter((a) => a.status === 'scheduled')?.
  sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];

  const unreadNotifs = notifications?.filter((n) => !n.read).length || 0;
  const latestRx = prescriptions?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6">
      
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t("citizen.good")}
            {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{todayStr}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/citizen/book')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/20">
          
          <icons.Calendar className="h-4 w-4" />{t("citizen.book_appointment")}

        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label={t("citizen.appointments")} value={appointments?.length || 0} sub={t("citizen.total_visits")} icon={icons.Calendar} color="blue" href="/dashboard/citizen/appointments" />
        <KPICard label={t("citizen.prescriptions")} value={prescriptions?.length || 0} sub={t("citizen.active_records")} icon={icons.FileText} color="emerald" href="/dashboard/citizen/prescriptions" />
        <KPICard label={t("citizen.family_members")} value={family?.length || 0} sub={t("citizen.linked_accounts")} icon={icons.Users} color="purple" href="/dashboard/citizen/family" />
        <KPICard label={t("citizen.notifications")} value={unreadNotifs} sub={t("citizen.unread_messages")} icon={icons.Bell} color={unreadNotifs > 0 ? 'red' : 'amber'} href="/dashboard/citizen/notifications" />
      </div>

      {/* Upcoming Appointment Banner */}
      {upcomingAppointment ?
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/10 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <icons.Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{t("citizen.next_appointment")}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mt-0.5">{upcomingAppointment.doctorName}</p>
              <p className="text-xs text-slate-500">{upcomingAppointment.hospitalName} · {upcomingAppointment.appointmentDate}{t("citizen.at")}{upcomingAppointment.appointmentTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 capitalize">
              {upcomingAppointment.status}
            </span>
            <button
            onClick={() => router.push('/dashboard/citizen/appointments')}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition">{t("citizen.manage")}


          </button>
          </div>
        </div> :

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("citizen.no_appointments_scheduled")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("citizen.schedule_a_consultation_with_a_doctor_near_you")}</p>
          </div>
          <button
          onClick={() => router.push('/dashboard/citizen/book')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition whitespace-nowrap">{t("citizen.book_now")}


        </button>
        </div>
      }

      {/* Main Grid: Prescriptions + Health Summary / Hospitals + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols: Recent Rx + Reports */}
        <div className="lg:col-span-2 space-y-6">

          {/* Health Summary */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("citizen.health_summary")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t("citizen.your_personal_health_profile")}</p>
              </div>
              <div className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', profile?.bloodGroup ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}>
                {profile?.bloodGroup ? `Blood Group: ${profile.bloodGroup}` : 'Profile incomplete'}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("citizen.blood_group")}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">{profile?.bloodGroup || '—'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("citizen.allergies")}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate">
                  {profile?.allergies?.length ? profile.allergies[0] : 'None'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("citizen.emergency")}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate">
                  {profile?.emergencyContact || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Latest Prescription */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("citizen.latest_prescription")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t("citizen.most_recent_medication_record")}</p>
              </div>
              <Link href="/dashboard/citizen/prescriptions" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("citizen.view_all")}

              </Link>
            </div>
            {latestRx ?
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{latestRx.diagnosis}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {typeof latestRx.createdAt === 'string' ? latestRx.createdAt : 'Recent'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {latestRx.medicines.slice(0, 4).map((m, i) =>
                <span key={i} className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                      {m.name} · {m.dosage}
                    </span>
                )}
                  {latestRx.medicines.length > 4 &&
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-500">
                      +{latestRx.medicines.length - 4}{t("citizen.more")}
                </span>
                }
                </div>
              </div> :

            <div className="flex flex-col items-center justify-center py-8 text-center">
                <icons.FileText className="h-8 w-8 text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-500">{t("citizen.no_prescriptions_yet")}</p>
                <p className="text-[11px] text-slate-400 mt-1">{t("citizen.your_prescriptions_will_appear_after_a_consultation")}</p>
              </div>
            }
          </div>

          {/* Recent Lab Reports */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("citizen.lab_reports")}</h2>
              <Link href="/dashboard/citizen/reports" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("citizen.view_all")}</Link>
            </div>
            {reports && reports.length > 0 ?
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.slice(0, 3).map((rep) =>
              <div key={rep.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                        <icons.Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{rep.reportName}</p>
                        <p className="text-[11px] text-slate-400">{rep.labName}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{rep.testDate}</span>
                  </div>
              )}
              </div> :

            <div className="flex flex-col items-center justify-center py-6 text-center">
                <icons.BarChart2 className="h-8 w-8 text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-500">{t("citizen.no_reports_available")}</p>
              </div>
            }
          </div>
        </div>

        {/* Right col: Quick Actions + Nearby Hospitals + Notifications */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{t("citizen.quick_actions")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
              { label: t("citizen.book_visit"), icon: icons.Calendar, href: '/dashboard/citizen/book', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
              { label: t("citizen.find_hospital"), icon: icons.Building2, href: '/dashboard/citizen/hospitals', color: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' },
              { label: t("citizen.family"), icon: icons.Users, href: '/dashboard/citizen/family', color: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' },
              { label: t("citizen.lab_reports"), icon: icons.BarChart2, href: '/dashboard/citizen/reports', color: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' }].
              map((a) =>
              <Link key={a.href} href={a.href} className={cn('flex flex-col items-center gap-2 rounded-lg p-3.5 text-center transition font-semibold text-xs', a.color)}>
                  <a.icon className="h-5 w-5" />
                  {a.label}
                </Link>
              )}
            </div>
          </div>

          {/* Nearby Hospitals */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("citizen.nearby_hospitals")}</h2>
              <Link href="/dashboard/citizen/hospitals" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("citizen.see_all")}</Link>
            </div>
            {hospitals && hospitals.length > 0 ?
            <div className="space-y-3">
                {hospitals.slice(0, 3).map((h) =>
              <div key={h.hospitalId} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                      <icons.Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{h.hospitalName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{h.address}</p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{t("citizen.open")}</span>
                  </div>
              )}
              </div> :

            <p className="text-xs text-slate-400 text-center py-4">{t("citizen.no_facilities_found")}</p>
            }
          </div>

          {/* Recent Notifications */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("citizen.notifications")}</h2>
              <Link href="/dashboard/citizen/notifications" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("citizen.see_all")}</Link>
            </div>
            {notifications && notifications.length > 0 ?
            <div className="space-y-3">
                {notifications.slice(0, 3).map((n) =>
              <div key={n.id} className={cn('flex gap-3 items-start rounded-lg p-2.5 transition', !n.read ? 'bg-blue-50/50 dark:bg-blue-950/10' : '')}>
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                      <icons.Bell className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
              )}
              </div> :

            <p className="text-xs text-slate-400 text-center py-4">{t("citizen.all_caught_up")}</p>
            }
          </div>
        </div>
      </div>
    </motion.div>);

}