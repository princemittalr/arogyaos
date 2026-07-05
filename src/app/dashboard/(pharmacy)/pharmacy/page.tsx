'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePharmacyInventory, useDispenseHistory } from '@/features/pharmacy/hooks/usePharmacy';
import { LoadingState, PageHeader } from '@/features/shared';
import {
  Package,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  History,
  Sparkles,
  ClipboardList,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function PharmacyDashboardPage() {
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_city_gen'; // fallback or shared doc

  const { data: inventory, isLoading: isInvLoading } = usePharmacyInventory(hospitalId);
  const { data: history, isLoading: isHistLoading } = useDispenseHistory(hospitalId);

  if (isInvLoading || isHistLoading) {
    return <LoadingState variant="card" />;
  }

  const items = inventory || [];
  const logs = history || [];

  // Metrics calculations
  const totalMeds = items.length;
  const outOfStock = items.filter((i) => i.quantity <= 0).length;
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= i.minimumStock).length;

  // Expiring soon: within 30 days
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiringSoon = items.filter((i) => {
    const expDate = new Date(i.expiryDate);
    return expDate > today && expDate <= thirtyDaysLater;
  }).length;

  const expiredCount = items.filter((i) => new Date(i.expiryDate) <= today).length;

  // Inventory Health Score: % of active items that are neither expired, out of stock, nor low stock
  const healthyCount = items.filter((i) => i.quantity > i.minimumStock && new Date(i.expiryDate) > today).length;
  const healthScore = totalMeds > 0 ? Math.round((healthyCount / totalMeds) * 100) : 100;

  // Chart data: Mocking some monthly inventory transaction trends
  const trendData = [
    { name: 'Jan', stockLevel: 2400, dispensed: 400 },
    { name: 'Feb', stockLevel: 2200, dispensed: 300 },
    { name: 'Mar', stockLevel: 2600, dispensed: 500 },
    { name: 'Apr', stockLevel: 2300, dispensed: 450 },
    { name: 'May', stockLevel: 2800, dispensed: 600 },
    { name: 'Jun', stockLevel: 3100, dispensed: 550 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy Control Center"
        description={`Logged in as Pharmacist. Monitor stock limits, dispense medications, and analyze stock health scores.`}
      />

      {/* Analytics Row */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Health Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Health Score</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">{healthScore}%</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">active healthy stock level ratio</p>
        </div>

        {/* Total Medicines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Medicines</span>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">{totalMeds}</p>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">unique medical formulas active</p>
        </div>

        {/* Stock Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stock Warnings</span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{lowStock}</span>
            <span className="text-xs text-slate-450 font-bold">low</span>
            <span className="text-3xl font-extrabold text-red-500 ml-2">{outOfStock}</span>
            <span className="text-xs text-slate-450 font-bold">empty</span>
          </div>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">require immediate procurement replenishment</p>
        </div>

        {/* Expiring Soon */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expiring / Expired</span>
            <Flame className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-650 dark:text-indigo-400">{expiringSoon}</span>
            <span className="text-xs text-slate-450 font-bold">soon</span>
            <span className="text-3xl font-extrabold text-red-650 dark:text-red-400 ml-2">{expiredCount}</span>
            <span className="text-xs text-slate-450 font-bold">expired</span>
          </div>
          <p className="text-[10px] text-slate-450 font-semibold mt-1">flagged for shelf disposal registry</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns: Trend Graph & Recent Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">Dispensing vs Stock Level</h3>
                <p className="text-[10px] text-slate-450 font-semibold">Monthly metrics tracking stock rotation</p>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="stockLevel" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStock)" strokeWidth={2} />
                  <Area type="monotone" dataKey="dispensed" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent dispensing history */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">Recent Dispensing Activity</h3>
                <p className="text-[10px] text-slate-450 font-semibold">Track audit trail of outgoing prescription packages</p>
              </div>
              <History className="h-5 w-5 text-slate-400" />
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-550">
                No recent dispensing logs recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {logs.slice(0, 4).map((log) => (
                  <div key={log.dispenseId} className="py-3 flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                    <div>
                      <p className="text-slate-900 dark:text-slate-100">{log.patientName}</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                        {log.medicines.map((m) => `${m.name} (x${m.quantity})`).join(', ')}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {log.dispensedAt.split('T')[1].slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights, Quick Actions */}
        <div className="space-y-6">
          {/* AI Predictor Placeholder */}
          <div className="rounded-2xl border border-blue-150 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-950/10 space-y-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Gemini Stock replenishment Forecast</h4>
            </div>
            <p className="text-[11px] font-semibold text-slate-650 dark:text-slate-350 leading-relaxed">
              &quot;Based on the historical prescribing frequency and seasonal monsoon damp conditions, Metformin 500mg is forecasted to run completely out within 3 days. Recommend initiating procurement order of 5,000 tablets today.&quot;
            </p>
            <div className="border-t border-blue-150 dark:border-blue-900/30 pt-3">
              <Link
                href="/dashboard/pharmacy/inventory"
                className="text-[10px] font-black uppercase text-blue-650 hover:underline flex items-center gap-1"
              >
                Go to stock replenishment desk <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider">Operations Panel</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/pharmacy/dispense"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 p-3 text-center transition"
              >
                <ClipboardList className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300 block">Dispense Rx</span>
              </Link>

              <Link
                href="/dashboard/pharmacy/inventory"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 p-3 text-center transition"
              >
                <Layers className="h-5 w-5 text-indigo-500 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300 block">Manage Stock</span>
              </Link>

              <Link
                href="/dashboard/pharmacy/expiry"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 p-3 text-center transition"
              >
                <Calendar className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300 block">Expiry Check</span>
              </Link>

              <Link
                href="/dashboard/pharmacy/reports"
                className="rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 p-3 text-center transition"
              >
                <History className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300 block">Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
