'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useReports } from '@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, StatusBadge, EmptyState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function CitizenReportsPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Queries
  const { data: reports, isLoading } = useReports(uid);

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  const handleDownload = (name: string) => {
    toast.success(`Download generated for report file: ${name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <PageHeader
        title="Lab Reports Registry"
        description="Verify laboratory diagnostic records, blood tests, and clinical files."
      />

      {reports && reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((rep) => (
            <motion.div
              key={rep.id}
              whileHover={{ y: -1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                    {rep.reportName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Clinic: {rep.labName} &bull; Conducted on: {rep.testDate}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <StatusBadge status={rep.status} />
                  <button
                    onClick={() => handleDownload(rep.reportName)}
                    className={`${componentStyles.button.base} ${componentStyles.button.outline} px-3.5 py-2 text-xs flex items-center gap-1.5`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Lab Results Table */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wide">
                  Clinical Results
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(rep.results).map(([key, val]) => (
                    <div
                      key={key}
                      className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 text-xs font-semibold text-left space-y-1"
                    >
                      <span className="text-slate-500 block uppercase tracking-wide text-[9px]">
                        {key}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                        {val as React.ReactNode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No diagnostic reports available"
          description="Lab report summaries will be written here as soon as diagnosis results are processed."
          icon={icons.FileText || icons.Home}
        />
      )}
    </motion.div>
  );
}
