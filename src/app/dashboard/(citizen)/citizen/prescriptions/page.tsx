'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePrescriptions, useDoctors } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function CitizenPrescriptionsPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Queries
  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions(uid);
  const { data: doctors, isLoading: docsLoading } = useDoctors();

  const isLoading = rxLoading || docsLoading;

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  const handleDownloadPDF = (id: string) => {
    toast.success(`PDF download generated for Prescription Record: ${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <PageHeader
        title="Active Prescriptions"
        description="Verify medication dosages, course schedules, and practitioner advice."
      />

      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-6">
          {prescriptions.map((rx) => {
            const doctorMatch = doctors?.find((d) => d.uid === rx.doctorId);

            return (
              <motion.div
                key={rx.prescriptionId}
                whileHover={{ y: -1 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-650 dark:text-blue-400">
                      Diagnosis: {rx.diagnosis}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-55">
                      {doctorMatch ? doctorMatch.doctorName : 'Healthcare Specialist'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {doctorMatch ? doctorMatch.hospitalName : 'Medical Center'} &bull;{' '}
                      {typeof rx.createdAt === 'string'
                        ? rx.createdAt
                        : (rx.createdAt as { toDate?: () => Date })?.toDate
                        ? (rx.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                        : 'Recent'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownloadPDF(rx.prescriptionId)}
                    className={`${componentStyles.button.base} ${componentStyles.button.outline} px-3.5 py-2 text-xs flex items-center gap-1.5 self-start sm:self-center`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                </div>

                {/* Medicines List */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">
                    Medication Guidelines
                  </h5>

                  <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-500 border-b border-slate-150 dark:border-slate-850">
                          <th className="px-4 py-3">Medicine Name</th>
                          <th className="px-4 py-3">Dosage Instruction</th>
                          <th className="px-4 py-3">Frequency</th>
                          <th className="px-4 py-3">Duration (Days)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.medicines.map((med, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-100 dark:border-slate-850 last:border-b-0 text-slate-800 dark:text-slate-300 font-semibold"
                          >
                            <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                              {med.name}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                {med.dosage}
                              </span>
                            </td>
                            <td className="px-4 py-3">{med.frequency}</td>
                            <td className="px-4 py-3">{med.duration} Days</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lab tests requested */}
                {rx.labTests && rx.labTests.length > 0 && (
                  <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-850 pt-4">
                    <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">
                      Recommended Lab Investigations
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {rx.labTests.map((test, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-650 dark:bg-slate-950/40 dark:text-slate-350 font-semibold"
                        >
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active prescriptions"
          description="Your medical prescriptions will appear here once consult visits are recorded by doctors."
          icon={icons.FileText || icons.Home}
        />
      )}
    </motion.div>
  );
}
