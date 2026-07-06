'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Archive,
  RefreshCw,
  Folder,
  Tag as TagIcon,
  User,
  Building2,
  Calendar,
  History,
} from 'lucide-react';
import { PrescriptionRecord } from '../types';
import { PdfGenerationService } from '../services/PdfGenerationService';
import { useRefillTracker } from '../hooks/useRefillTracker';
import { useFolders } from '@/features/medical-documents/hooks/useFolders';
import { useTags } from '@/features/medical-documents/hooks/useTags';
import { FolderAssignModal } from '@/features/medical-documents/components/FolderAssignModal';
import { TagAssignModal } from '@/features/medical-documents/components/TagAssignModal';
import { RefillRequestModal } from './RefillRequestModal';

const pdfService = new PdfGenerationService();

function resolveDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === 'object' && 'toDate' in val) {
    const obj = val as { toDate?: () => unknown };
    if (typeof obj.toDate === 'function') {
      const date = obj.toDate();
      if (date instanceof Date) {
        return date;
      }
    }
  }
  return new Date(val as string | number);
}

interface PrescriptionDetailDrawerProps {
  prescription: PrescriptionRecord;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  isProcessing: boolean;
}

export function PrescriptionDetailDrawer({
  prescription,
  patientId,
  patientName,
  onClose,
  onArchive,
  onRestore,
  isProcessing,
}: PrescriptionDetailDrawerProps) {
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  // Hook for subcollection refill history
  const { refills, refetch: refetchRefills } = useRefillTracker(prescription.recordId);

  // MDM Integration hooks
  const { folders } = useFolders(patientId);
  const { tags, mappings, assignDocumentFolder, assignDocumentTags, createTag } = useTags(patientId);

  // Resolve current folder & tags
  const currentMapping = mappings.find((m) => m.recordId === prescription.recordId);
  const currentFolderId = currentMapping?.folderId || null;
  const currentFolder = folders.find((f) => f.folderId === currentFolderId);
  const currentTagIds = currentMapping?.tagIds || [];
  const currentTags = tags.filter((t) => currentTagIds.includes(t.tagId));

  const handlePrint = () => {
    pdfService.print(prescription, patientName, prescription.doctorName, prescription.hospitalName);
  };

  const handleFolderSave = async (folderId: string | null) => {
    try {
      await assignDocumentFolder(prescription.recordId, folderId);
      setShowFolderModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagsSave = async (tagIds: string[]) => {
    try {
      await assignDocumentTags(prescription.recordId, tagIds);
      setShowTagModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagCreate = async (name: string, color: string) => {
    return createTag(name, color);
  };

  const dateStr = prescription.metadata?.createdAt
    ? resolveDate(prescription.metadata.createdAt).toLocaleDateString()
    : 'Recent';

  const validUntilStr = prescription.validUntil
    ? resolveDate(prescription.validUntil).toLocaleDateString()
    : 'N/A';

  const isArchived = prescription.metadata?.status === 'ARCHIVED';

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-850 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-md uppercase tracking-wider">
              Rx Slip
            </span>
            <span className="text-xs text-slate-400 font-bold">
              ID: {prescription.recordId.slice(-8).toUpperCase()}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Prescription Details
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick actions bar */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Rx</span>
          </button>
          {!isArchived ? (
            <button
              onClick={() => onArchive(prescription.recordId)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900 hover:text-red-650 dark:hover:text-red-400 text-slate-700 dark:text-slate-350 rounded-xl transition-colors"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </button>
          ) : (
            <button
              onClick={() => onRestore(prescription.recordId)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-900 hover:text-blue-650 dark:hover:text-blue-400 text-slate-700 dark:text-slate-350 rounded-xl transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Restore</span>
            </button>
          )}
          {prescription.status === 'Active' && !isArchived && (
            <button
              onClick={() => setShowRefillModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-md shadow-blue-550/15 transition-colors ml-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Request Refill</span>
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-850 p-4.5 rounded-2xl space-y-3">
          <div className="flex items-center gap-3 text-xs">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-500 font-bold block">Doctor</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{prescription.doctorName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-500 font-bold block">Hospital</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{prescription.hospitalName}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5 text-xs">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 font-bold block">Issued</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">{dateStr}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 font-bold block">Expires</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">{validUntilStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MDM Folders & Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
            Health Vault Location & Tags
          </h4>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Folder Assign */}
            <button
              onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 transition-colors"
            >
              <Folder className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentFolder ? currentFolder.name : 'Unassigned Folder'}</span>
            </button>

            {/* Tag Assign */}
            <button
              onClick={() => setShowTagModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-350 transition-colors"
            >
              <TagIcon className="h-3.5 w-3.5 text-slate-400" />
              <span>Manage Tags</span>
            </button>

            {/* Rendered Tags */}
            {currentTags.map((tag) => (
              <span
                key={tag.tagId}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Medications List */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
            Prescribed Medications
          </h4>
          <div className="space-y-3">
            {prescription.medicines.map((med, idx) => (
              <div
                key={med.medicineId || idx}
                className="border border-slate-150 dark:border-slate-800 p-4 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {med.name}
                    </h5>
                    {med.brandName && (
                      <p className="text-[11px] text-slate-400 font-semibold">{med.brandName}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 rounded text-xs font-bold text-slate-600 dark:text-slate-300">
                    {med.formulation || 'tablet'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs pt-1.5 border-t border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-slate-400 font-bold block">Dosage</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      {med.dosage.pattern}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Timing</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      {med.dosage.timing}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Duration</span>
                    <span className="font-extrabold text-blue-650 dark:text-blue-300">
                      {med.schedule.durationDays} Days
                    </span>
                  </div>
                </div>
                {med.instructions && (
                  <div className="bg-slate-50 dark:bg-slate-950/20 px-3 py-2 rounded-xl text-xs text-slate-500 font-semibold border border-slate-100 dark:border-slate-850">
                    Instruction: {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Refill Log History */}
        {prescription.refillsAllowed > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-slate-400" />
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                Refill Log History
              </h4>
            </div>
            <div className="space-y-2">
              {refills.map((refill) => {
                const dateVal = resolveDate(refill.requestedAt).toLocaleDateString();

                const statusStyles: Record<string, string> = {
                  requested: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/15 dark:text-yellow-400 dark:border-yellow-900',
                  authorized: 'bg-blue-50 text-blue-750 border-blue-200 dark:bg-blue-950/15 dark:text-blue-450 dark:border-blue-900',
                  dispensed: 'bg-emerald-50 text-emerald-705 border-emerald-200 dark:bg-emerald-950/15 dark:text-emerald-450 dark:border-emerald-900',
                  rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/15 dark:text-rose-450 dark:border-rose-900',
                };

                return (
                  <div
                    key={refill.refillId}
                    className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/40 dark:bg-slate-950/10 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                        {refill.pharmacyName || 'Partner Pharmacy'}
                      </span>
                      <span className="text-[10px] text-slate-450 font-bold">{dateVal}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${statusStyles[refill.status]}`}>
                      {refill.status}
                    </span>
                  </div>
                );
              })}
              {refills.length === 0 && (
                <div className="text-center py-4 text-xs italic text-slate-400 bg-slate-50/20 dark:bg-slate-950/5 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
                  No refill attempts registered.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals integrations */}
      {showRefillModal && (
        <RefillRequestModal
          prescription={prescription}
          uid={patientId}
          onClose={() => setShowRefillModal(false)}
          onSuccess={refetchRefills}
        />
      )}

      <FolderAssignModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        folders={folders}
        selectedFolderId={currentFolderId}
        onSave={handleFolderSave}
      />

      <TagAssignModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        availableTags={tags}
        selectedTagIds={currentTagIds}
        onSave={handleTagsSave}
        onCreateTag={handleTagCreate}
      />
    </div>
  );
}

export default PrescriptionDetailDrawer;
