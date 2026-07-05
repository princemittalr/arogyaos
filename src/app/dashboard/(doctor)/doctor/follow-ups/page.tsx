'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDoctorFollowUps } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { Calendar, User, Clock } from 'lucide-react';

export default function DoctorFollowUpsPage() {
  const { user } = useAuth();
  const doctorId = user?.uid || 'doc_arav_mehta';

  const { data: followUps, isLoading } = useDoctorFollowUps(doctorId);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'missed'>('upcoming');

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const filteredFups = followUps?.filter((f) => f.status === activeTab) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Re-visit Registry"
        description="Monitor recovery progression milestones, chronic condition follow-ups, or check-in schedules."
      />

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold select-none">
        {(['upcoming', 'completed', 'missed'] as const).map((tab) => (
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

      {/* Follow-ups List */}
      {filteredFups.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Calendar className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">No {activeTab} follow-ups scheduled</p>
          <p className="text-xs text-slate-450 mt-1">Re-visit reminders scheduled during consultations will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredFups.map((fup) => (
            <div key={fup.followUpId} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{fup.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Follow Up ID: {fup.followUpId}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {fup.followUpDate}
                  </span>
                </div>

                {fup.notes && (
                  <p className="text-[10px] text-slate-500 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
                    Notes: {fup.notes}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] font-bold text-slate-650 dark:text-slate-400">
                <span>Status:</span>
                <span className="capitalize text-blue-650 dark:text-blue-400">{fup.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
