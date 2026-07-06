'use client';

import React, { useState } from 'react';
import { LabReportRecord } from '../types';
import { X, Folder, Tag, Printer } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFolders } from '@/features/medical-documents/hooks/useFolders';
import { useTags } from '@/features/medical-documents/hooks/useTags';
import { FolderAssignModal } from '@/features/medical-documents/components/FolderAssignModal';
import { TagAssignModal } from '@/features/medical-documents/components/TagAssignModal';
import { LabPdfService } from '../services/LabPdfService';

const pdfService = new LabPdfService();

interface LabReportDetailDrawerProps {
  report: LabReportRecord;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onArchive: (report: LabReportRecord) => void;
  onRestore: (report: LabReportRecord) => void;
  isProcessing: boolean;
}

export function LabReportDetailDrawer({
  report,
  patientId,
  patientName,
  onClose,
  onArchive,
  onRestore,
  isProcessing,
}: LabReportDetailDrawerProps) {
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  // MDM Integration hooks
  const { folders } = useFolders(patientId);
  const { tags, mappings, assignDocumentFolder, assignDocumentTags, createTag } = useTags(patientId);

  // Resolve current folder & tags
  const currentMapping = mappings.find((m) => m.recordId === report.recordId);
  const currentFolderId = currentMapping?.folderId || null;
  const currentFolder = folders.find((f) => f.folderId === currentFolderId);
  const currentTagIds = currentMapping?.tagIds || [];
  const currentTags = tags.filter((t) => currentTagIds.includes(t.tagId));

  const dateStr = report.metadata?.createdAt
    ? new Date(
        (report.metadata.createdAt as { toDate?: () => Date }).toDate
          ? (report.metadata.createdAt as { toDate: () => Date }).toDate()
          : (report.metadata.createdAt as string)
      ).toLocaleDateString()
    : 'Recent';

  const isArchived = report.metadata?.status === 'ARCHIVED';

  const handlePrint = () => {
    pdfService.print(report, patientName);
  };

  const handleFolderSave = async (folderId: string | null) => {
    try {
      await assignDocumentFolder(report.recordId, folderId);
      setShowFolderModal(false);
    } catch (err) {
      console.error('Failed to assign folder:', err);
    }
  };

  const handleTagsSave = async (tagIds: string[]) => {
    try {
      await assignDocumentTags(report.recordId, tagIds);
      setShowTagModal(false);
    } catch (err) {
      console.error('Failed to assign tags:', err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-850 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-md uppercase tracking-wider">
              Diagnostic Report
            </span>
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50 mt-1">
            {report.testName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 rounded-xl transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
        
        {/* Patient / Clinical details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-4.5 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Patient Name</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{patientName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Test Date</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{dateStr}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Laboratory Center</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{report.laboratoryName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Lead Technician</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{report.technicianName}</p>
          </div>
        </div>

        {/* MDM Folders & Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
            Health Vault Filing (MDM)
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {/* Folder button */}
            <button
              onClick={() => setShowFolderModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition"
            >
              <Folder className="h-4 w-4 text-amber-500" />
              <span>{currentFolder ? currentFolder.name : 'Unfiled'}</span>
            </button>

            {/* Tags button */}
            <button
              onClick={() => setShowTagModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition"
            >
              <Tag className="h-4 w-4 text-blue-500" />
              <span>
                {currentTags.length > 0
                  ? currentTags.map((t) => t.name).join(', ')
                  : 'Add Tags'}
              </span>
            </button>
          </div>
        </div>

        {/* Observations Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
            Test Parameter Findings
          </h4>
          <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 border-b border-slate-100 dark:border-slate-850">
                  <th className="p-3 font-extrabold uppercase tracking-wider">Parameter</th>
                  <th className="p-3 font-extrabold uppercase tracking-wider">Value</th>
                  <th className="p-3 font-extrabold uppercase tracking-wider">Reference</th>
                  <th className="p-3 font-extrabold uppercase tracking-wider">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {(report.observations || []).map((obs) => (
                  <tr key={obs.parameter} className="hover:bg-slate-50/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{obs.parameter}</td>
                    <td className="p-3 font-extrabold text-slate-950 dark:text-slate-50">{obs.value} {obs.unit}</td>
                    <td className="p-3 text-slate-500">{obs.referenceRange}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border',
                          obs.isAbnormal
                            ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                        )}
                      >
                        {obs.isAbnormal ? 'Abnormal' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit info */}
        <div className="bg-slate-50/40 dark:bg-slate-950/10 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 space-y-2 text-[10px] font-mono text-slate-500">
          <p className="font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-1">Security Audit Details</p>
          <p>Checksum: {report.metadata?.checksum || 'Pending verification'}</p>
          <p>Platform Source: {report.metadata?.source || 'practitioner'}</p>
          <p>Device OS: {report.metadata?.origin?.platform || 'linux'} · Browser: {report.metadata?.origin?.browser || 'headless'}</p>
        </div>

      </div>

      {/* Footer actions */}
      <div className="p-4.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
          <button
            disabled={isProcessing}
            onClick={() => (isArchived ? onRestore(report) : onArchive(report))}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border',
              isArchived
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800'
            )}
          >
            {isArchived ? 'Restore' : 'Archive'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition"
        >
          Close
        </button>
      </div>

      {/* MDM Modals */}
      {showFolderModal && (
        <FolderAssignModal
          isOpen={showFolderModal}
          onClose={() => setShowFolderModal(false)}
          folders={folders}
          selectedFolderId={currentFolderId}
          onSave={handleFolderSave}
        />
      )}

      {showTagModal && (
        <TagAssignModal
          isOpen={showTagModal}
          onClose={() => setShowTagModal(false)}
          availableTags={tags}
          selectedTagIds={currentTagIds}
          onSave={handleTagsSave}
          onCreateTag={createTag}
        />
      )}

    </div>
  );
}
