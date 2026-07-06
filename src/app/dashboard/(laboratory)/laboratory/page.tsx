'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function LaboratoryDashboardPage() {const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{t("laboratory.laboratory_test_desk")}</h1>
      <p className="text-slate-500">{t("laboratory.welcome_technician")}{user?.fullName || 'Technician'}{t("laboratory.manage_sample_collecting_requests_test_catalogs_and_report_uploads")}</p>
    </div>);

}