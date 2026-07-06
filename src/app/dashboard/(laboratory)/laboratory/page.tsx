'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { TechnicianWorkdesk } from '@/features/laboratory/components/TechnicianWorkdesk';
import { PageHeader } from '@/features/shared';
import { motion } from 'framer-motion';

export default function LaboratoryDashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const hospitalId = 'hosp_city_gen'; // Match standard hospital context in ArogyaOS

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <PageHeader
        title={t("laboratory.laboratory_test_desk")}
        description={`${t("laboratory.welcome_technician")} ${user?.fullName || 'Technician'}. ${t("laboratory.manage_sample_collecting_requests_test_catalogs_and_report_uploads")}`}
      />

      <TechnicianWorkdesk hospitalId={hospitalId} />
    </motion.div>
  );
}