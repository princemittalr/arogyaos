'use client';

import React, { useState, useMemo } from 'react';
import { RadiologyStudy } from '../types';
import { StudyDetailDrawer } from './StudyDetailDrawer';
import { Search, AlertCircle, FileText, ChevronRight, Grid, Calendar, Database } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RadiologyRegistryProps {
  studies: RadiologyStudy[];
  patientId: string;
  patientName: string;
  archiveStudy: (reportId: string) => Promise<void>;
  restoreStudy: (reportId: string) => Promise<void>;
  isProcessing: boolean;
}

export function RadiologyRegistry({
  studies,
  patientId,
  patientName,
  archiveStudy,
  restoreStudy,
  isProcessing,
}: RadiologyRegistryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [selectedStudy, setSelectedStudy] = useState<RadiologyStudy | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'compare'>('list');

  // Multi-study comparison selection state
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  // 1. Filter studies list
  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      // Search matches
      const matchesSearch =
        study.bodySite.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (study.report?.radiologistName || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Modality matches
      const matchesModality = selectedModality === 'ALL' || study.modality === selectedModality;

      // Status matches (Archived means the linked vault report status is ARCHIVED)
      const isArchived = study.report?.metadata?.status === 'ARCHIVED';
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && !isArchived) ||
        (selectedStatus === 'ARCHIVED' && isArchived);

      return matchesSearch && matchesModality && matchesStatus;
    });
  }, [studies, searchQuery, selectedModality, selectedStatus]);

  // Unique modalities present in records
  const modalitiesAvailable = useMemo(() => {
    const set = new Set(studies.map((s) => s.modality));
    return ['ALL', ...Array.from(set)];
  }, [studies]);

  const handleToggleComparison = (studyId: string) => {
    setComparisonIds((prev) =>
      prev.includes(studyId) ? prev.filter((id) => id !== studyId) : [...prev, studyId]
    );
  };

  const selectedForComparison = useMemo(() => {
    return studies.filter((s) => comparisonIds.includes(s.studyInstanceUid));
  }, [studies, comparisonIds]);

  return (
    <div className="space-y-6">
      
      {/* Header view toggle */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('list')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5',
              activeView === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Database className="h-4 w-4" />
            <span>Scan Registry</span>
          </button>
          <button
            onClick={() => setActiveView('compare')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition inline-flex items-center gap-1.5',
              activeView === 'compare'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Grid className="h-4 w-4" />
            <span>Study Comparison Matrix ({comparisonIds.length})</span>
          </button>
        </div>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Filters Panel */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by facility, radiologist, or site..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition duration-150"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
              {/* Modality filter selection */}
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold focus:outline-none text-slate-700 dark:text-slate-300"
              >
                {modalitiesAvailable.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod === 'ALL' ? 'All Modalities' : mod}
                  </option>
                ))}
              </select>

              {/* Status Toggles */}
              <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl">
                {(['ACTIVE', 'ARCHIVED'] as const).map((stat) => (
                  <button
                    key={stat}
                    onClick={() => setSelectedStatus(stat)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150',
                      selectedStatus === stat
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-350 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {stat === 'ACTIVE' ? 'Active' : 'Archived'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table List Registry */}
          <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/10">
            {filteredStudies.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredStudies.map((study) => {
                  const dateVal = study.completedAt || study.startedAt || 'Recent';
                  const dateFormatted = new Date(dateVal).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const isChecked = comparisonIds.includes(study.studyInstanceUid);

                  return (
                    <div
                      key={study.studyInstanceUid}
                      className={cn(
                        'p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition cursor-pointer',
                        study.report?.isCritical && 'bg-rose-50/10 dark:bg-rose-950/5'
                      )}
                      onClick={() => setSelectedStudy(study)}
                    >
                      {/* Left Block: Info & Checkbox */}
                      <div className="flex items-start gap-3.5 text-left">
                        {/* Checkbox wrapper to prevent row-click triggering */}
                        <div
                          className="pt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComparison(study.studyInstanceUid);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-50 border-slate-200 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900 uppercase">
                              {study.modality}
                            </span>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                              {study.bodySite} Study
                            </span>
                            {study.report?.isCritical && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400 rounded-md uppercase">
                                <AlertCircle className="h-3 w-3" />
                                <span>Critical Finding</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1.5">
                            Facility: <span className="font-bold">{study.hospitalName}</span> · Referring Clinician:{' '}
                            <span className="font-bold">{study.referredBy}</span>
                          </p>
                          {study.report && (
                            <p className="text-[11px] font-sans text-slate-400 italic mt-1 line-clamp-1">
                              Conclusion: &ldquo;{study.report.impression}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Status & Navigation */}
                      <div className="flex items-center gap-4.5 justify-between sm:justify-end">
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-450 uppercase">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{dateFormatted}</span>
                          </div>
                          <span
                            className={cn(
                              'inline-block text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded uppercase border',
                              study.status === 'completed'
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-750 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-450'
                                : study.status === 'in-progress'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
                                : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400'
                            )}
                          >
                            {study.status.replace('_', ' ')}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-2 text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                <FileText className="h-10 w-10 text-slate-300" />
                <span className="text-xs font-semibold">No medical imaging scans found matching the criteria.</span>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Tab 2: Comparison Matrix View */
        <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/10">
          {selectedForComparison.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 border-b border-slate-100 dark:border-slate-850">
                    <th className="p-4 font-extrabold uppercase tracking-wider w-1/4">Metric</th>
                    {selectedForComparison.map((study) => (
                      <th key={study.studyInstanceUid} className="p-4 font-extrabold uppercase tracking-wider">
                        {study.modality} - {new Date(study.completedAt || study.startedAt || 0).toLocaleDateString()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 leading-relaxed">
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-4 font-bold text-slate-500">Body anatomical site</td>
                    {selectedForComparison.map((study) => (
                      <td key={study.studyInstanceUid} className="p-4 font-extrabold text-slate-800 dark:text-slate-200">
                        {study.bodySite}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-4 font-bold text-slate-500">Facility / Clinic</td>
                    {selectedForComparison.map((study) => (
                      <td key={study.studyInstanceUid} className="p-4 text-slate-800 dark:text-slate-200 font-semibold">
                        {study.hospitalName}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-4 font-bold text-slate-500">Referring Clinician</td>
                    {selectedForComparison.map((study) => (
                      <td key={study.studyInstanceUid} className="p-4 text-slate-800 dark:text-slate-200">
                        {study.referredBy}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-4 font-bold text-slate-500">DICOM instances count</td>
                    {selectedForComparison.map((study) => (
                      <td key={study.studyInstanceUid} className="p-4 font-mono text-slate-800 dark:text-slate-200">
                        {study.numberOfInstances} Slices ({study.numberOfSeries} Series)
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-4 font-bold text-slate-500">Clinical Findings Summary</td>
                    {selectedForComparison.map((study) => (
                      <td key={study.studyInstanceUid} className="p-4 text-slate-700 dark:text-slate-300 align-top">
                        {study.report ? (
                          <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
                            {study.report.findings}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Report Pending</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-50/30">
                    <td className="p-4 font-bold text-slate-500">Diagnostic Impression</td>
                    {selectedForComparison.map((study) => (
                      <td key={study.studyInstanceUid} className="p-4 text-emerald-800 dark:text-emerald-450 font-extrabold align-top">
                        {study.report ? (
                          <div className="bg-emerald-50/30 dark:bg-emerald-950/15 p-3 rounded-lg border border-emerald-100/30">
                            {study.report.impression}
                          </div>
                        ) : (
                          <span className="text-slate-450 italic">Report Pending</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-2 text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
              <Grid className="h-10 w-10 text-slate-350" />
              <span className="text-xs font-semibold">Select checkboxes on multiple scans in the Registry list to compare their findings side-by-side.</span>
            </div>
          )}
        </div>
      )}

      {/* Drawer detailed viewport */}
      {selectedStudy && (
        <StudyDetailDrawer
          study={selectedStudy}
          patientId={patientId}
          patientName={patientName}
          onClose={() => setSelectedStudy(null)}
          onArchive={archiveStudy}
          onRestore={restoreStudy}
          isProcessing={isProcessing}
        />
      )}

    </div>
  );
}
export default RadiologyRegistry;
