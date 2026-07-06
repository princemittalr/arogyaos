'use client';

import React, { useState } from 'react';
import { RadiologyStudy } from '../types';
import { KeyImageViewer } from './KeyImageViewer';
import { X, Info, Folder, Tag, Printer, HardDrive } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFolders } from '@/features/medical-documents/hooks/useFolders';
import { useTags } from '@/features/medical-documents/hooks/useTags';
import { FolderAssignModal } from '@/features/medical-documents/components/FolderAssignModal';
import { TagAssignModal } from '@/features/medical-documents/components/TagAssignModal';

interface StudyDetailDrawerProps {
  study: RadiologyStudy;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onArchive: (reportId: string) => void;
  onRestore: (reportId: string) => void;
  isProcessing: boolean;
}

export function StudyDetailDrawer({
  study,
  patientId,
  patientName,
  onClose,
  onArchive,
  onRestore,
  isProcessing,
}: StudyDetailDrawerProps) {
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'findings' | 'dicom' | 'key_images'>('findings');

  // MDM Integration
  const { folders } = useFolders(patientId);
  const { tags, mappings, assignDocumentFolder, assignDocumentTags, createTag } = useTags(patientId);

  // Resolve current folder & tags for this report
  const reportId = study.report?.reportId || '';
  const currentMapping = mappings.find((m) => m.recordId === reportId);
  const currentFolderId = currentMapping?.folderId || null;
  const currentFolder = folders.find((f) => f.folderId === currentFolderId);
  const currentTagIds = currentMapping?.tagIds || [];
  const currentTags = tags.filter((t) => currentTagIds.includes(t.tagId));

  const isArchived = study.report?.metadata?.status === 'ARCHIVED';

  const dateStr = study.completedAt
    ? new Date(study.completedAt).toLocaleDateString()
    : study.startedAt
    ? new Date(study.startedAt).toLocaleDateString()
    : 'Recent';

  const handlePrint = () => {
    if (!study.report) return;

    // Create printer-friendly iframe
    const printContent = `
      <html>
        <head>
          <title>Radiology Report - ${study.modality} ${study.bodySite}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; color: #111; }
            .header p { margin: 5px 0 0 0; font-size: 12px; color: #666; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; font-size: 13px; }
            .meta-item { border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .meta-label { font-weight: bold; color: #777; text-transform: uppercase; font-size: 10px; }
            .meta-val { font-weight: 800; color: #111; margin-top: 2px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px dashed #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; }
            .section-body { font-size: 13px; white-space: pre-wrap; }
            .critical { background: #ffebeb; border: 1px solid #ffccd0; padding: 10px; border-radius: 6px; color: #d32f2f; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
            .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 11px; color: #888; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ArogyaOS Diagnostic Imaging Report</h1>
            <p>Certified Pathology & Radiology Network · Secure ID: ${study.studyInstanceUid}</p>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><div class="meta-label">Patient Name</div><div class="meta-val">${patientName}</div></div>
            <div class="meta-item"><div class="meta-label">Study Date</div><div class="meta-val">${dateStr}</div></div>
            <div class="meta-item"><div class="meta-label">Modality / Site</div><div class="meta-val">${study.modality} - ${study.bodySite}</div></div>
            <div class="meta-item"><div class="meta-label">Referring Clinician</div><div class="meta-val">${study.referredBy}</div></div>
            <div class="meta-item"><div class="meta-label">Reading Radiologist</div><div class="meta-val">${study.report.radiologistName}</div></div>
            <div class="meta-item"><div class="meta-label">Status</div><div class="meta-val">FINAL SIGNED</div></div>
          </div>
          ${study.report.isCritical ? `<div class="critical">CRITICAL FINDING WARNING: ${study.report.impression}</div>` : ''}
          <div class="section">
            <div class="section-title">Clinical Findings</div>
            <div class="section-body">${study.report.findings}</div>
          </div>
          <div class="section">
            <div class="section-title">Diagnostic Impression</div>
            <div class="section-body" style="font-weight: bold;">${study.report.impression}</div>
          </div>
          <div class="footer">
            <div>Verification: digitally_signed_by_${study.report.radiologistId}</div>
            <div>ArogyaOS Digital Health Platform</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();
    }

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  const handleFolderSave = async (folderId: string | null) => {
    if (!reportId) return;
    try {
      await assignDocumentFolder(reportId, folderId);
      setShowFolderModal(false);
    } catch (err) {
      console.error('Failed to assign folder:', err);
    }
  };

  const handleTagsSave = async (tagIds: string[]) => {
    if (!reportId) return;
    try {
      await assignDocumentTags(reportId, tagIds);
      setShowTagModal(false);
    } catch (err) {
      console.error('Failed to assign tags:', err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-850 shrink-0">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900 rounded-md uppercase tracking-wider">
            Radiology Imaging Study
          </span>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50 mt-1">
            {study.modality} {study.bodySite}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 rounded-xl transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-850 px-6 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
        <button
          onClick={() => setActiveTab('findings')}
          className={cn(
            'py-3 text-xs font-bold border-b-2 px-3 transition -mb-px',
            activeTab === 'findings'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Report findings
        </button>
        <button
          onClick={() => setActiveTab('dicom')}
          className={cn(
            'py-3 text-xs font-bold border-b-2 px-3 transition -mb-px',
            activeTab === 'dicom'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          DICOM Metadata
        </button>
        <button
          onClick={() => setActiveTab('key_images')}
          className={cn(
            'py-3 text-xs font-bold border-b-2 px-3 transition -mb-px',
            activeTab === 'key_images'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Key Slices ({study.report?.keyImages?.length || 0})
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
        
        {/* Basic Study Metrics Card */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50/70 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-4.5 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Patient Name</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{patientName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Study Date</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{dateStr}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Facility</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{study.hospitalName}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wide text-[9px]">Referring Clinician</span>
            <p className="font-extrabold text-slate-800 dark:text-slate-100">{study.referredBy}</p>
          </div>
        </div>

        {/* Tab 1: Findings */}
        {activeTab === 'findings' && (
          <div className="space-y-5">
            {study.report ? (
              <>
                {/* MDM Integration Buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">MDM Filing</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowFolderModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition"
                    >
                      <Folder className="h-4 w-4 text-amber-500" />
                      <span>{currentFolder ? currentFolder.name : 'Unfiled'}</span>
                    </button>
                    <button
                      onClick={() => setShowTagModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 transition"
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

                {/* Critical banner */}
                {study.report.isCritical && (
                  <div className="bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900 rounded-xl p-3.5 text-xs text-rose-700 dark:text-rose-400 font-bold">
                    ⚠️ Critical Findings flagged by Radiologist. Prompt clinical follow-up is recommended.
                  </div>
                )}

                {/* Findings body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Findings Notes</h4>
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed white-space-pre-wrap">
                    {study.report.findings}
                  </div>
                </div>

                {/* Impressions body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Clinical Impression</h4>
                  <div className="bg-slate-55 border border-emerald-100 dark:border-emerald-950/30 p-4 rounded-xl text-xs text-emerald-800 dark:text-emerald-450 font-bold leading-relaxed">
                    {study.report.impression}
                  </div>
                </div>

                {/* Pathologist credentials */}
                <div className="bg-slate-50/40 dark:bg-slate-950/10 rounded-2xl border border-slate-100 dark:border-slate-850 p-4 space-y-2 text-[10px] font-mono text-slate-500">
                  <p className="font-bold text-[9px] uppercase tracking-wider text-slate-450">Signature Credentials</p>
                  <p>Certified Radiologist: {study.report.radiologistName}</p>
                  <p>Electronic Sign ID: signed_by_{study.report.radiologistId}</p>
                  <p>Time Signet: {new Date(study.report.signedAt).toLocaleString()}</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-slate-450">
                <Info className="h-8 w-8 text-slate-350" />
                <span className="text-xs font-semibold">Study results are pending. The radiologist has not signed off on findings yet.</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: DICOM Metadata */}
        {activeTab === 'dicom' && (
          <div className="space-y-5">
            {/* DICOM Header details */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                <HardDrive className="h-4 w-4 text-slate-500" />
                <span>PACS Index Metadata</span>
              </h4>
              <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    <tr className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-slate-500">Study Instance UID</td>
                      <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{study.studyInstanceUid}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-slate-500">Modality Type</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{study.modality}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-slate-500">Body Anatomical Site</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">{study.bodySite}</td>
                    </tr>
                    {study.dicomMetadata?.manufacturer && (
                      <tr className="hover:bg-slate-50/30">
                        <td className="p-3 font-semibold text-slate-500">Scanner Manufacturer</td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">{study.dicomMetadata.manufacturer}</td>
                      </tr>
                    )}
                    {study.dicomMetadata?.accessionNumber && (
                      <tr className="hover:bg-slate-50/30">
                        <td className="p-3 font-semibold text-slate-500">Accession Number</td>
                        <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{study.dicomMetadata.accessionNumber}</td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-slate-500">DICOM Series Count</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">{study.numberOfSeries} Series</td>
                    </tr>
                    <tr className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-slate-500">DICOM Instance Count</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">{study.numberOfInstances} Instances / Slices</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Series structure listing */}
            {study.series && study.series.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Series & Slices Structure</h4>
                <div className="space-y-2">
                  {study.series.map((ser) => (
                    <div key={ser.seriesInstanceUid} className="p-3 bg-slate-50/65 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-[11px] leading-relaxed">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">
                        Series #{ser.number}: {ser.description || 'No description'}
                      </p>
                      <p className="text-slate-450 font-mono mt-0.5">UID: ...{ser.seriesInstanceUid.slice(-16)}</p>
                      <p className="text-slate-500 mt-1 font-bold">Modality: {ser.modality} · {ser.instances?.length || 0} Slice instances</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Key Images */}
        {activeTab === 'key_images' && (
          <div className="space-y-4">
            {study.report?.keyImages && study.report.keyImages.length > 0 ? (
              <KeyImageViewer slices={study.report.keyImages} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-slate-450">
                <Info className="h-8 w-8 text-slate-350" />
                <span className="text-xs font-semibold">No diagnostic key image slices associated with this report.</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          {study.report && (
            <>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print / PDF</span>
              </button>
              <button
                disabled={isProcessing}
                onClick={() => (isArchived ? onRestore(reportId) : onArchive(reportId))}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border',
                  isArchived
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800'
                )}
              >
                {isArchived ? 'Restore' : 'Archive'}
              </button>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-855 rounded-xl transition"
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
export default StudyDetailDrawer;
