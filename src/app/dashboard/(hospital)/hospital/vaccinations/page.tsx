'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { ProviderWorkspace } from '@/features/vaccinations/components/ProviderWorkspace';

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

export default function HospitalVaccinationsPage() {
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_default';
  const hospitalName = (user as { hospitalName?: string })?.hospitalName || 'ArogyaOS Immunization Center';

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProviderWorkspace hospitalId={hospitalId} hospitalName={hospitalName} />
    </Suspense>
  );
}
