'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { VaccinationRegistry } from '@/features/vaccinations/components/VaccinationRegistry';

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="grid grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function CitizenVaccinationsPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';
  const fullName = user?.fullName || 'Patient';

  if (!uid) {
    return (
      <div className="flex items-center justify-center py-24 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-500">Authentication required</p>
          <p className="text-xs text-slate-400 mt-1">Please sign in to view your vaccination records.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <VaccinationRegistry patientId={uid} patientName={fullName} />
    </Suspense>
  );
}
