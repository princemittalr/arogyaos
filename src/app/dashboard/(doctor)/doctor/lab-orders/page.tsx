'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorLabOrders } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function DoctorLabOrdersPage() {
  const { user } = useAuth();
  const doctorId = user?.uid || 'doc_arav_mehta';

  const { data: labOrders, isLoading } = useDoctorLabOrders(doctorId);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const filteredOrders = labOrders?.filter((o) => o.status === activeTab) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Test Recommendations"
        description="Verify status updates for diagnostic requests, blood profiles, or radiology recommendations."
      />

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold select-none">
        {(['pending', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 capitalize relative transition ${
              activeTab === tab
                ? 'text-blue-650 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lab Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Activity className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">No {activeTab} lab orders found</p>
          <p className="text-xs text-slate-450 mt-1">Recommended lab tests from consultations will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredOrders.map((order) => {
            const dateStr = typeof order.createdAt === 'string' ? order.createdAt.split('T')[0] : 'Today';

            return (
              <div key={order.orderId} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{order.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Order ID: {order.orderId}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md">
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {order.testNames.map((test, idx) => (
                      <span key={idx} className="rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 text-[9px] font-bold">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] font-bold">
                  {order.status === 'pending' ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Sample Collection Pending
                    </span>
                  ) : order.status === 'completed' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Diagnostic Panel Released
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      Order Cancelled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
