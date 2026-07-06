'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCitizenProfile } from '@/features/citizen/hooks/useCitizen';
import { useLabReports } from '@/features/laboratory/hooks/useLabReports';
import { LabReportRecord, LabObservation } from '@/features/laboratory/types';
import { LabReportRow } from '@/features/laboratory/components/LabReportRow';
import { LabReportFilterBar } from '@/features/laboratory/components/LabReportFilterBar';
import { LabReportDetailDrawer } from '@/features/laboratory/components/LabReportDetailDrawer';
import { LabTrendCharts } from '@/features/laboratory/components/LabTrendCharts';
import { LabCompareMatrix } from '@/features/laboratory/components/LabCompareMatrix';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { LabPdfService } from '@/features/laboratory/services/LabPdfService';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ClipboardList, TrendingUp, Grid } from 'lucide-react';

const pdfService = new LabPdfService();

export default function CitizenReportsPage() {
  const { user } = useAuth();
  const uid = user?.uid || '';

  // Profiles and Reports queries
  const { data: profile, isLoading: profileLoading } = useCitizenProfile(uid);
  const { data: reports, isLoading: reportsLoading, archiveReport, restoreReport, isMutating } = useLabReports(uid);

  // Tab State
  const [activeTab, setActiveTab] = useState<'registry' | 'trends' | 'compare'>('registry');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // all, active, archived
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);

  // Drawer State
  const [selectedReport, setSelectedReport] = useState<LabReportRecord | null>(null);

  const isLoading = reportsLoading || profileLoading;

  // Filter reports
  const filteredReports = React.useMemo(() => {
    if (!reports) return [];
    return reports.filter((rep) => {
      // 1. Search Query filter (matches testName or laboratoryName)
      const matchesSearch =
        rep.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.laboratoryName.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category status filter
      const isArchived = rep.metadata?.status === 'ARCHIVED';
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'active' && !isArchived) ||
        (selectedCategory === 'archived' && isArchived);

      // 3. Abnormal Flag filter
      const matchesAbnormal =
        !showAbnormalOnly ||
        (rep.observations && rep.observations.some((obs: LabObservation) => obs.isAbnormal));

      return matchesSearch && matchesCategory && matchesAbnormal;
    });
  }, [reports, searchQuery, selectedCategory, showAbnormalOnly]);

  const patientName = profile?.fullName || user?.fullName || 'Patient Name';

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  const handlePrint = (report: LabReportRecord) => {
    pdfService.print(report, patientName);
  };

  const handleArchiveToggle = async (report: LabReportRecord) => {
    const isArchived = report.metadata?.status === 'ARCHIVED';
    if (isArchived) {
      await restoreReport(report.recordId);
    } else {
      await archiveReport(report.recordId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <PageHeader
        title="Laboratory Reports Vault"
        description="Access and verify clinical blood panels, biomarker observations, and track health trends over time."
      />

      {/* Tabs System */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('registry')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition',
            activeTab === 'registry'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Diagnostic Registry</span>
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition',
            activeTab === 'trends'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Biomarker Trends</span>
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-px transition',
            activeTab === 'compare'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          <Grid className="h-4 w-4" />
          <span>Comparison Matrix</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'registry' && (
          <div className="space-y-6">
            <LabReportFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showAbnormalOnly={showAbnormalOnly}
              setShowAbnormalOnly={setShowAbnormalOnly}
            />

            {filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <LabReportRow
                    key={report.recordId}
                    report={report}
                    onViewDetails={(r) => setSelectedReport(r)}
                    onPrint={handlePrint}
                    onArchiveToggle={handleArchiveToggle}
                    isProcessing={isMutating}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Reports Found"
                description="Try adjusting your search query, status filters, or abnormal alert configurations."
                icon={icons.FileText || icons.Home}
              />
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <LabTrendCharts reports={reports || []} />
        )}

        {activeTab === 'compare' && (
          <LabCompareMatrix reports={reports || []} />
        )}
      </div>

      {/* Details Slide-Over Drawer */}
      {selectedReport && (
        <LabReportDetailDrawer
          report={selectedReport}
          patientId={uid}
          patientName={patientName}
          onClose={() => setSelectedReport(null)}
          onArchive={handleArchiveToggle}
          onRestore={handleArchiveToggle}
          isProcessing={isMutating}
        />
      )}
    </motion.div>
  );
}