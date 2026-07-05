'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCitizenProfile,
  useAppointments,
  usePrescriptions,
  useReports,
  useNotifications,
  useHospitals,
  useFamilyMembers,
} from '@/features/citizen/hooks/useCitizen';
import {
  StatCard,
  MetricCard,
  QuickActions,
  PageHeader,
  LoadingState,
  StatusBadge,
} from '@/features/shared';
import { icons } from '@/design-system/icons';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const uid = user?.uid || '';

  // Queries
  const { data: profile, isLoading: profileLoading } = useCitizenProfile(uid);
  const { data: appointments, isLoading: apptsLoading } = useAppointments(uid);
  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions(uid);
  const { data: reports, isLoading: reportsLoading } = useReports(uid);
  const { data: notifications, isLoading: notifLoading } = useNotifications(uid);
  const { data: hospitals, isLoading: hospLoading } = useHospitals();
  const { data: family, isLoading: familyLoading } = useFamilyMembers(uid);

  const isLoading =
    profileLoading ||
    apptsLoading ||
    rxLoading ||
    reportsLoading ||
    notifLoading ||
    hospLoading ||
    familyLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/4 rounded bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingState variant="card" />
          <LoadingState variant="card" />
          <LoadingState variant="card" />
        </div>
        <LoadingState variant="table" rows={3} />
      </div>
    );
  }

  // Next upcoming scheduled appointment
  const upcomingAppointment = appointments
    ?.filter((a) => a.status === 'scheduled')
    ?.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];

  const quickActionsData = [
    {
      label: 'Book Consultation',
      description: 'Schedule a virtual or physical visit with a specialist.',
      icon: icons.Calendar || icons.Home,
      onClick: () => router.push('/dashboard/citizen/book'),
      color: 'blue' as const,
    },
    {
      label: 'Family Members',
      description: 'Link and manage health cards of family relations.',
      icon: icons.Users || icons.Home,
      onClick: () => router.push('/dashboard/citizen/family'),
      color: 'emerald' as const,
    },
    {
      label: 'Find Hospitals',
      description: 'Search verified hospitals, test labs, and pharmacies.',
      icon: icons.Building || icons.Home,
      onClick: () => router.push('/dashboard/citizen/hospitals'),
      color: 'purple' as const,
    },
    {
      label: 'Lab Reports',
      description: 'View diagnostic reports and historical health timelines.',
      icon: icons.FileText || icons.Home,
      onClick: () => router.push('/dashboard/citizen/reports'),
      color: 'amber' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* 1. Welcome Section */}
      <PageHeader
        title={`Welcome back, ${user?.fullName || 'Citizen'}`}
        description="Here is your unified health status report and active healthcare options."
      />

      {/* 2. Top-level Health Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Emergency Contact"
          value={profile?.emergencyContact || 'Not Set'}
          icon={icons.AlertTriangle || icons.Home}
          description="Primary contact listed on your Health Card"
        />
        <MetricCard
          title="Health Profile Sync"
          value={profile?.bloodGroup ? `${profile.bloodGroup} Blood Group` : 'Incomplete'}
          percentage={profile?.bloodGroup ? 100 : 40}
          color="emerald"
          description={
            profile?.allergies && profile.allergies.length > 0
              ? `Allergic to: ${profile.allergies.join(', ')}`
              : 'No known allergies reported'
          }
        />
        <StatCard
          title="Linked Family Members"
          value={family?.length || 0}
          icon={icons.Users || icons.Home}
          description="Access linked health accounts"
        />
      </div>

      {/* 3. Upcoming Appointment Alert Card */}
      {upcomingAppointment ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 dark:border-blue-900/30 dark:bg-blue-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-550 text-white p-3.5 hidden sm:block">
              <icons.Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Upcoming Appointment
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">
                {upcomingAppointment.doctorName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {upcomingAppointment.hospitalName} &bull; {upcomingAppointment.appointmentDate} at{' '}
                {upcomingAppointment.appointmentTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={upcomingAppointment.status} />
            <button
              onClick={() => router.push('/dashboard/citizen/appointments')}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
            >
              Manage
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-500">No appointments scheduled</p>
          <button
            onClick={() => router.push('/dashboard/citizen/book')}
            className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Schedule your first consultation now &rarr;
          </button>
        </div>
      )}

      {/* 4. Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50">Operations Center</h3>
        <QuickActions actions={quickActionsData} />
      </div>

      {/* 5. Health Timeline (Prescriptions & Reports) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Prescriptions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">
              Active Prescriptions
            </h4>
            <button
              onClick={() => router.push('/dashboard/citizen/prescriptions')}
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            {prescriptions && prescriptions.length > 0 ? (
              prescriptions.slice(0, 2).map((rx) => (
                <div
                  key={rx.prescriptionId}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-200">
                      Diagnosis: {rx.diagnosis}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {typeof rx.createdAt === 'string'
                        ? rx.createdAt
                        : (rx.createdAt as { toDate?: () => Date })?.toDate
                        ? (rx.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                        : 'Recent'}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {rx.medicines.map((m, idx) => (
                      <span
                        key={idx}
                        className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                      >
                        {m.name} ({m.dosage})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No active prescriptions.</p>
            )}
          </div>
        </div>

        {/* Recent Lab Reports */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">
              Recent Lab Reports
            </h4>
            <button
              onClick={() => router.push('/dashboard/citizen/reports')}
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            {reports && reports.length > 0 ? (
              reports.slice(0, 2).map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-200 block">
                      {rep.reportName}
                    </span>
                    <span className="text-[10px] text-slate-450 block">{rep.labName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{rep.testDate}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No diagnostic reports.</p>
            )}
          </div>
        </div>
      </div>

      {/* 6. Nearby Hospitals & Family Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nearby Hospitals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">
              Nearby Health Facilities
            </h4>
            <button
              onClick={() => router.push('/dashboard/citizen/hospitals')}
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              Search Facilities
            </button>
          </div>

          <div className="space-y-3">
            {hospitals && hospitals.length > 0 ? (
              hospitals.slice(0, 3).map((h) => (
                <div key={h.hospitalId} className="flex justify-between items-center text-xs py-1">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-250 block">
                      {h.hospitalName}
                    </span>
                    <span className="text-slate-400 block">{h.address}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-450 font-bold">Open</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No facilities registered.</p>
            )}
          </div>
        </div>

        {/* Notifications & System Sync */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">
              Recent Notifications
            </h4>
            <button
              onClick={() => router.push('/dashboard/citizen/notifications')}
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              Inbox
            </button>
          </div>

          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 2).map((notif) => (
                <div key={notif.id} className="flex gap-3 text-xs items-start">
                  <div className="rounded-full bg-blue-50 dark:bg-blue-950/20 p-1.5 text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <icons.Bell className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {notif.title}
                    </span>
                    <span className="text-slate-500 block leading-normal">{notif.message}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">All caught up.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
