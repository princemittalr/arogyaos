'use client';

import React from 'react';
import { useHospitalInventory } from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { AlertTriangle, AlertCircle, ShoppingBag, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PharmacyOverviewPage() {
  const hospitalId = 'hosp_city_gen';
  const { data: inventory, isLoading } = useHospitalInventory(hospitalId);

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  // Telemetry
  const totalMedicines = inventory?.length || 0;
  const lowStockItems = inventory?.filter((i) => i.status === 'low_stock') || [];
  const expiredItems = inventory?.filter((i) => i.status === 'expired') || [];

  // Inventory Health Rating
  const inventoryHealth = totalMedicines > 0 ? Math.round(((totalMedicines - lowStockItems.length - expiredItems.length) / totalMedicines) * 100) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy Hub"
        description="Inspect medical stock thresholds, check expiration dateline warnings, and optimize critical quotas."
      />

      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Inventory Health</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{inventoryHealth}%</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Weighted catalog compliance.</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Formulas</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{totalMedicines}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Unique medicine units.</span>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/10 p-6 dark:border-red-950/20 dark:bg-slate-900">
          <span className="text-xs text-red-650 dark:text-red-400 font-bold uppercase tracking-wider">Low Stock alerts</span>
          <p className="text-3xl font-extrabold text-red-650 dark:text-red-400 mt-1">{lowStockItems.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Below target reserve minimum.</span>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/10 p-6 dark:border-orange-950/20 dark:bg-slate-900">
          <span className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Expired Formulas</span>
          <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-1">{expiredItems.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Requiring active disposal.</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Low Stock Alerts & Expirations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Warnings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Critical Refill Warnings</span>
            </h3>

            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No current low-stock warnings.</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.inventoryId} className="flex justify-between items-center bg-red-50/10 border border-red-100/30 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-250">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Min Stock Threshold: {item.minimumStock} &bull; Supplier: {item.supplier}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-red-650 dark:text-red-400">{item.quantity} units</span>
                      <span className="text-[9px] text-slate-400 font-bold">Action Needed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiration List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-1.5">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Expiration Safety Registry</span>
            </h3>

            {expiredItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active formulas have expired.</p>
            ) : (
              <div className="space-y-3">
                {expiredItems.map((item) => (
                  <div key={item.inventoryId} className="flex justify-between items-center bg-orange-50/10 border border-orange-100/30 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-250">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Expired On: {item.expiryDate as string}</p>
                    </div>
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[9px] font-extrabold text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                      Disposal Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Sync */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mb-4">Stock Control Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/hospital/inventory" className="flex items-center gap-3 rounded-xl border border-slate-150 p-3.5 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-850 transition">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250">Inventory Ledger</p>
                  <p className="text-[9px] text-slate-500">Add or edit formula catalog items</p>
                </div>
              </Link>
              <div className="flex items-center gap-3 rounded-xl border border-slate-150 p-3.5 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-850 cursor-pointer transition">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250">Bulk Procurement</p>
                  <p className="text-[9px] text-slate-500">Draft supplier request order bills</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-150 p-3.5 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-850 cursor-pointer transition">
                <Sparkles className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250">Gemini Audit Optimizer</p>
                  <p className="text-[9px] text-slate-500">Predict quarterly consumption patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
