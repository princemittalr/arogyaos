'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePharmacyInventory, useUpdateInventoryItemMutation } from '@/features/pharmacy/hooks/usePharmacy';
import { PageHeader, LoadingState } from '@/features/shared';
import { Calendar, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpiryMonitoringPage() {
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_city_gen';

  const { data: inventory, isLoading } = usePharmacyInventory(hospitalId);
  const updateMutation = useUpdateInventoryItemMutation();

  const [activeTab, setActiveTab] = useState<'soon' | 'expired'>('soon');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const items = inventory || [];
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  // Expiring soon: > today and <= 30 days
  const soonItems = items.filter((i) => {
    const expDate = new Date(i.expiryDate);
    return expDate > today && expDate <= thirtyDaysLater;
  });

  // Expired: <= today
  const expiredItems = items.filter((i) => {
    const expDate = new Date(i.expiryDate);
    return expDate <= today;
  });

  const listToDisplay = activeTab === 'soon' ? soonItems : expiredItems;

  const handleDispose = async (inventoryId: string) => {
    try {
      await updateMutation.mutateAsync({
        inventoryId,
        hospitalId,
        data: { status: 'inactive', quantity: 0 },
      });
      toast.success('Expired batch marked as inactive and cleared from active shelves.');
    } catch {
      toast.error('Failed to commit shelf disposal update.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expiry & Batch Lifecycles"
        description="Verify active shelf expiration intervals, flag expired batches, and log disposal audits."
      />

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('soon')}
          className={`pb-3.5 relative transition ${
            activeTab === 'soon'
              ? 'text-blue-650 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Expiring Within 30 Days ({soonItems.length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`pb-3.5 relative transition ${
            activeTab === 'expired'
              ? 'text-red-650 dark:text-red-400 font-bold border-b-2 border-red-600 dark:border-red-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Expired Inventory ({expiredItems.length})
        </button>
      </div>

      {/* Warning Alert Banner */}
      {expiredItems.length > 0 && (
        <div className="rounded-xl border border-red-150 bg-red-50/30 p-4 dark:border-red-950/20 dark:bg-red-950/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-red-700 dark:text-red-400">Critical Expiry Warning Alert</h4>
            <p className="text-[10px] text-slate-500">
              There are {expiredItems.length} expired medicine formulations remaining in stock. These must be immediately cleared from dispensary shelves to comply with drug regulatory safety metrics.
            </p>
          </div>
        </div>
      )}

      {/* List Grid */}
      {listToDisplay.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">All shelves clear</p>
          <p className="text-xs text-slate-450 mt-1">No medicines match the selected expiry criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {listToDisplay.map((item) => (
            <div key={item.inventoryId} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{item.medicineName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Batch Code: {item.batchNumber} &bull; Supplier: {item.supplier}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    In Stock: {item.quantity} units
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-red-650">
                  <Calendar className="h-4 w-4" /> Expiry Date: {item.expiryDate}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 dark:border-slate-850 pt-3">
                {activeTab === 'expired' ? (
                  <button
                    onClick={() => handleDispose(item.inventoryId)}
                    className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                  >
                    <Flame className="h-3.5 w-3.5" /> Dispose Formula
                  </button>
                ) : (
                  <span className="text-[10px] text-amber-600 font-bold">
                    Marked for Prioritized Dispensation
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
