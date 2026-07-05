'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useDoctorProfile,
  useDoctorQueue,
  useDoctorFollowUps,
} from '@/features/doctor/hooks/useDoctor';
import { LoadingState } from '@/features/shared';
import {
  Users,
  Calendar,
  Activity,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const uid = user?.uid || 'doc_arav_mehta';

  // Fetch telemetry and queue
  const { data: profile, isLoading: profileLoading } = useDoctorProfile(uid);
  const { data: queue, isLoading: queueLoading } = useDoctorQueue(uid);
  const { data: followUps, isLoading: followUpsLoading } = useDoctorFollowUps(uid);

  if (profileLoading || queueLoading || followUpsLoading) {
    return <LoadingState variant="table" />;
  }

  const todayQueue = queue || [];
  const completedToday = todayQueue.filter((a) => a.status === 'completed').length;
  const pendingToday = todayQueue.filter((a) => a.status === 'scheduled' || a.status === 'checked_in').length;
  const nextPatient = todayQueue.find((a) => a.status === 'checked_in') || todayQueue.find((a) => a.status === 'scheduled');
  const dueFollowUps = followUps?.filter((f) => f.status === 'upcoming') || [];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              AI Clinical Copilot Active
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, Dr. {profile?.fullName.split(' ').pop()}
            </h1>
            <p className="text-blue-100/90 text-sm max-w-xl font-medium">
              You have <span className="underline decoration-amber-400 decoration-2 font-bold">{pendingToday} patients</span> waiting in your outpatient queue today. Your AI assistant has generated summary briefings for your clinical files.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/doctor/calendar"
              className="rounded-2xl bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md hover:bg-white/15 transition flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" /> Manage Calendar
            </Link>
            {nextPatient && (
              <Link
                href={`/dashboard/doctor/consultation/${nextPatient.appointmentId}`}
                className="rounded-2xl bg-amber-400 px-5 py-3 text-xs font-bold text-slate-900 hover:bg-amber-350 transition flex items-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" /> Start Next Consultation
              </Link>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-60 w-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* Telemetry Dashboard Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today&apos;s Visits</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">{todayQueue.length}</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">outpatient schedule slots</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">{completedToday}</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">prescriptions compiled successfully</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Queue</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">{pendingToday}</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">active patients in waiting lobby</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Follow-ups Due</span>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">{dueFollowUps.length}</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">scheduled re-visits this week</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Waiting Queue & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">Today&apos;s Appointment Desk</h3>
                <p className="text-[11px] text-slate-450 font-medium">Real-time status updates of active outpatient visits</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                Date: {new Date().toISOString().split('T')[0]}
              </span>
            </div>

            {todayQueue.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">No consultations scheduled for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {todayQueue.map((appt) => (
                  <div key={appt.appointmentId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-550/10 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-extrabold text-xs select-none">
                        #{appt.tokenNumber}
                      </div>
                      <div>
                        <Link href={`/dashboard/doctor/patient/${appt.patientId}`} className="text-xs font-bold text-slate-850 dark:text-slate-100 hover:text-blue-600 transition">
                          {appt.patientName}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Age: {appt.patientAge} &bull; Gender: {appt.patientGender} &bull; Time: {appt.appointmentTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold ${
                        appt.status === 'checked_in'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                          : appt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {appt.status.replace('_', ' ')}
                      </span>

                      {appt.status !== 'completed' && (
                        <Link
                          href={`/dashboard/doctor/consultation/${appt.appointmentId}`}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                        >
                          Consult <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Next Patient details & AI Panel & Quick Actions */}
        <div className="space-y-6">
          {/* Next Patient Vitals Spotlight */}
          {nextPatient && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <span className="text-[10px] uppercase font-black text-slate-450 tracking-wider">Patient Spotlight</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-md font-extrabold">Next In Line</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">{nextPatient.patientName}</h4>
                <p className="text-[10px] font-bold text-slate-400">Allergies: {nextPatient.patientAllergies?.join(', ') || 'None reported'}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">BP</span>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">120/80</span>
                </div>
                <div className="border-x border-slate-150 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 font-bold block">HR</span>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">72 bpm</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block">TEMP</span>
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">98.6°F</span>
                </div>
              </div>

              <Link
                href={`/dashboard/doctor/consultation/${nextPatient.appointmentId}`}
                className="w-full text-center rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 text-white py-2 text-xs font-bold block transition"
              >
                Open EMR Case file
              </Link>
            </div>
          )}

          {/* AI Clinical Assistant Widget */}
          <div className="rounded-2xl border border-blue-150 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-950/10 space-y-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Gemini Clinical briefing</h4>
            </div>
            <p className="text-[11px] font-semibold text-slate-650 dark:text-slate-350 leading-relaxed">
              &quot;Today&apos;s queue features high cardiac monitoring priority. Patient Rohan Sharma exhibits borderline hypertension (130/85 BP). Reviewing his lipid profiles prior to consultation is recommended.&quot;
            </p>
            <div className="border-t border-blue-150 dark:border-blue-900/30 pt-3">
              <button
                onClick={() => alert('AI Clinical commands configuration dialog under construction.')}
                className="text-[10px] font-bold text-blue-650 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5"
              >
                Configure Briefing Prompts <Sliders className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/doctor/patients" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Patients</span>
              </Link>
              <Link href="/dashboard/doctor/prescriptions" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <FileText className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Prescriptions</span>
              </Link>
              <Link href="/dashboard/doctor/lab-orders" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Activity className="h-5 w-5 text-indigo-600 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Lab Orders</span>
              </Link>
              <Link href="/dashboard/doctor/profile" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Sliders className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Duty Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
