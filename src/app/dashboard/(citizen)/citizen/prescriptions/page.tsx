'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/providers/AuthProvider';
import { usePrescriptions } from '@/features/prescriptions/hooks/usePrescriptions';
import { ActiveMedicationDashboard } from '@/features/prescriptions/components/ActiveMedicationDashboard';
import { MedicationTimeline } from '@/features/prescriptions/components/MedicationTimeline';
import { PrescriptionFilterBar } from '@/features/prescriptions/components/PrescriptionFilterBar';
import { PrescriptionRow } from '@/features/prescriptions/components/PrescriptionRow';
import { PrescriptionDetailDrawer } from '@/features/prescriptions/components/PrescriptionDetailDrawer';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { motion } from 'framer-motion';
import { PrescriptionRecord, PrescriptionStatus } from '@/features/prescriptions/types';

export default function CitizenPrescriptionsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || '';
  const fullName = user?.fullName || 'Patient';

  // 1. Fetch prescriptions via new query hook
  const { prescriptions, isLoading, archive, restore } = usePrescriptions(uid);

  // 2. State for filters and detail drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PrescriptionStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRecord | null>(null);

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  // 3. Client-side filtering & sorting logic
  const filteredPrescriptions = prescriptions
    .filter((rx) => {
      // Search matches
      const matchesSearch =
        searchQuery === '' ||
        rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.medicines.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status matches
      const matchesStatus = selectedStatus === 'all' || rx.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const getMs = (dateVal: unknown) => {
        if (!dateVal) return 0;
        if (typeof dateVal === 'object' && 'toDate' in dateVal) {
          const obj = dateVal as { toDate?: () => unknown };
          if (typeof obj.toDate === 'function') {
            const date = obj.toDate();
            if (date instanceof Date) {
              return date.getTime();
            }
          }
        }
        if (typeof dateVal === 'string') {
          return new Date(dateVal).getTime();
        }
        if (dateVal instanceof Date) {
          return dateVal.getTime();
        }
        return 0;
      };

      if (sortBy === 'oldest') {
        return getMs(a.metadata?.createdAt) - getMs(b.metadata?.createdAt);
      }
      if (sortBy === 'doctor') {
        return a.doctorName.localeCompare(b.doctorName);
      }
      if (sortBy === 'hospital') {
        return a.hospitalName.localeCompare(b.hospitalName);
      }
      // default: newest
      return getMs(b.metadata?.createdAt) - getMs(a.metadata?.createdAt);
    });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
  };

  // Find updated instance of the currently selected prescription if status changes
  const activeSelectedPrescription = selectedPrescription
    ? prescriptions.find((rx) => rx.recordId === selectedPrescription.recordId) || selectedPrescription
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <PageHeader
        title={t('citizen.active_prescriptions') || 'Prescriptions Vault'}
        description={
          t('citizen.verify_medication_dosages_course_schedules_and_practitioner_advice') ||
          'Monitor active drug courses, schedules, refills, and official doctor prescriptions.'
        }
      />

      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-8">
          {/* Active Medication Progress Dashboard */}
          <ActiveMedicationDashboard prescriptions={prescriptions} />

          {/* Gantt Schedule Timeline */}
          <MedicationTimeline prescriptions={prescriptions} />

          {/* Search, Sort and Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                All Prescriptions
              </h3>
            </div>

            <PrescriptionFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClear={handleClearFilters}
            />

            {/* List */}
            <div className="space-y-3">
              {filteredPrescriptions.map((rx) => (
                <PrescriptionRow
                  key={rx.recordId}
                  prescription={rx}
                  onClick={() => setSelectedPrescription(rx)}
                />
              ))}

              {filteredPrescriptions.length === 0 && (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-450 italic">
                    No prescriptions match the filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title={t('citizen.no_active_prescriptions') || 'No Prescriptions Found'}
          description={
            t(
              'citizen.your_medical_prescriptions_will_appear_here_once_consult_visits_are_recorded_by_doctors'
            ) || 'Your official digital clinical prescriptions will appear here once registered.'
          }
          icon={icons.FileText || icons.Home}
        />
      )}

      {/* Slide-over Drawer */}
      {activeSelectedPrescription && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-905/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedPrescription(null)}
          />

          <PrescriptionDetailDrawer
            prescription={activeSelectedPrescription}
            patientId={uid}
            patientName={fullName}
            onClose={() => setSelectedPrescription(null)}
            onArchive={archive}
            onRestore={restore}
            isProcessing={false}
          />
        </div>
      )}
    </motion.div>
  );
}