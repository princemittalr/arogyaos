'use client';

import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { RadiologistWorklist } from '@/features/radiology/components/RadiologistWorklist';
import { PageHeader } from '@/features/shared';
import { motion } from 'framer-motion';

export default function RadiologistImagingPage() {
  const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen'; // Standard hospital context in ArogyaOS

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <PageHeader
        title={t("radiology.radiology_imaging_desk") || "Radiology & Imaging Workdesk"}
        description={
          t("radiology.manage_imaging_studies") || 
          "Manage scheduled studies, complete scans, upload DICOM structures, and sign clinical reports."
        }
      />

      <RadiologistWorklist hospitalId={hospitalId} />
    </motion.div>
  );
}
