'use client';

import React, { useState } from 'react';
import { useHospitalProfile, useHospitalDoctors, useHospitalBeds, useHospitalInventory, useHospitalAppointments } from '@/features/hospital/hooks/useHospital';
import { LoadingState } from '@/features/shared';
import { motion } from 'framer-motion';
import {
  Building,
  Users,
  Bed,
  Activity,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Bot,
  UserCheck,
  Percent,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function HospitalDashboardPage() {
  const hospitalId = 'hosp_city_gen'; // Standard hospital ID

  // Fetch all necessary telemetry metrics from queries
  const { data: profile, isLoading: profileLoading } = useHospitalProfile(hospitalId);
  const { data: doctors, isLoading: docsLoading } = useHospitalDoctors(hospitalId);
  const { data: beds, isLoading: bedsLoading } = useHospitalBeds(hospitalId);
  const { data: inventory, isLoading: invLoading } = useHospitalInventory(hospitalId);
  const { data: appointments, isLoading: apptsLoading } = useHospitalAppointments(hospitalId);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  if (profileLoading || docsLoading || bedsLoading || invLoading || apptsLoading) {
    return <LoadingState variant="card" />;
  }

  // Derived telemetry metrics
  const activeDocsCount = doctors?.filter(d => d.attendanceStatus === 'present').length || 0;
  const totalBeds = beds?.length || 0;
  const occupiedBeds = beds?.filter(b => b.status === 'occupied').length || 0;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const lowStockMeds = inventory?.filter(i => i.status === 'low_stock' || i.status === 'expired').length || 0;
  
  // Today's appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments?.filter(a => a.appointmentDate === todayStr) || [];
  const pendingAppointments = todayAppointments.filter(a => a.status === 'scheduled') || [];

  const handleAiCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiResponse('Processing query through Gemini Healthcare Node... [Telemetry Analysis: Resource availability looks optimal. Recommended Action: Release Bed 101-A as patient Karan Sharma is marked for discharge today.]');
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-650 to-indigo-600 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            Operational Hub
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {profile?.hospitalName || 'City General Hospital'}
          </h1>
          <p className="text-sm text-blue-100 font-medium leading-relaxed">
            Administrative Console. Monitoring critical patient flow, clinician status, and emergency resource quotas.
          </p>
        </div>
      </div>

      {/* 2. Grid Dashboard Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Hospital Health Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Health Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">94%</span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> Excellent
              </span>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed mt-1">Weighted operational rating.</p>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="absolute transform -rotate-95 h-16 w-16">
              <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="6" />
              <circle cx="32" cy="32" r="28" className="stroke-emerald-500 fill-none" strokeWidth="6" strokeDasharray="176" strokeDashoffset="10" />
            </svg>
            <Percent className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        {/* Staff Attendance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clinicians</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{activeDocsCount}</span>
              <span className="text-xs text-slate-400">/ {doctors?.length || 0} active</span>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed mt-1">Staff present for shifts.</p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-600 dark:text-blue-400">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bed Occupancy</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{occupancyRate}%</span>
              <span className="text-xs text-slate-400">{occupiedBeds} occupied</span>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed mt-1">Capacity: {totalBeds} total beds.</p>
          </div>
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 text-indigo-600 dark:text-indigo-400">
            <Bed className="h-6 w-6" />
          </div>
        </div>

        {/* Pharmacy Health */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pharmacy Quota</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{lowStockMeds}</span>
              <span className="text-xs text-slate-400">warnings</span>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed mt-1">Critical stock levels.</p>
          </div>
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-red-650 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Telemetry Analytics + AI Command */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: AI Command Center & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Command Center */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">Gemini AI Command Center</h3>
            </div>
            <form onSubmit={handleAiCommand} className="space-y-3">
              <input
                type="text"
                placeholder="Ask Gemini to analyze bed availability, check low stock, or list active doctors..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-5 py-2.5 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Execute Analysis</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-150 dark:bg-slate-950 dark:border-slate-850 text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-350"
              >
                {aiResponse}
              </motion.div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4">Workspace Navigation</h3>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              <Link href="/dashboard/hospital/departments" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Building className="h-5 w-5 mx-auto mb-2 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">Departments</span>
              </Link>
              <Link href="/dashboard/hospital/doctors" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Users className="h-5 w-5 mx-auto mb-2 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">Doctor availability</span>
              </Link>
              <Link href="/dashboard/hospital/beds" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Bed className="h-5 w-5 mx-auto mb-2 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">Bed occupancy</span>
              </Link>
              <Link href="/dashboard/hospital/inventory" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Package className="h-5 w-5 mx-auto mb-2 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">Inventory stock</span>
              </Link>
              <Link href="/dashboard/hospital/laboratory" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Activity className="h-5 w-5 mx-auto mb-2 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">Laboratory Overview</span>
              </Link>
              <Link href="/dashboard/hospital/settings" className="rounded-xl border border-slate-150 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-center transition">
                <Settings className="h-5 w-5 mx-auto mb-2 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-350">Settings profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Critical Alerts & Active Staff */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6 dark:border-red-950/20 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-red-650 dark:text-red-400 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5" />
              <span>Critical Operations Sync</span>
            </h3>
            <div className="space-y-3.5">
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-ping" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200">Critical Stock Deficiency</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Amoxicillin 500mg stock is below minimal threshold (85 units remaining).</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200">ICU Capacity Notice</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">ICU Ward Room 101 currently has only 2 vacant bed allocations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's appointments outline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4 flex items-center justify-between">
              <span>Shift Queue</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                {pendingAppointments.length} scheduled
              </span>
            </h3>
            {todayAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No appointments scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appt) => (
                  <div key={appt.appointmentId} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Token #{appt.tokenNumber}</p>
                      <p className="text-[10px] text-slate-450">{appt.appointmentTime} &bull; {appt.appointmentDate}</p>
                    </div>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[9px] font-extrabold text-slate-500 dark:bg-slate-850">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
