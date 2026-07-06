'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useRadiologyStudies } from '@/features/radiology/hooks/useRadiologyStudies';
import { RadiologyRegistry } from '@/features/radiology/components/RadiologyRegistry';
import { PageHeader } from '@/features/shared';
import { motion } from 'framer-motion';

export default function CitizenImagingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const patientId = user?.uid || '';
  const patientName = user?.fullName || 'Citizen';

  const {
    data: studies = [],
    isLoading,
    archiveStudy,
    restoreStudy,
    isMutating,
  } = useRadiologyStudies(patientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-xs font-semibold text-slate-500">
        <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-2" />
        <span>Loading imaging studies vault...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <PageHeader
        title={t("radiology.radiology_and_imaging_records") || "Radiology & Medical Imaging Vault"}
        description={
          t("radiology.view_imaging_history") || 
          "Access your radiology scans, structured diagnostic impressions, and key slice thumbnails."
        }
      />

      <RadiologyRegistry
        studies={studies}
        patientId={patientId}
        patientName={patientName}
        archiveStudy={archiveStudy}
        restoreStudy={restoreStudy}
        isProcessing={isMutating}
      />
    </motion.div>
  );
}
