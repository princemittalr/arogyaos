'use client';

import React, { useState, useEffect } from 'react';
import { icons } from '@/design-system/icons';
import { HealthVaultService } from '../services/HealthVaultService';
import { StorageService } from '../services/StorageService';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { toast } from 'sonner';

import {
  BaseVaultRecord,
  TimelineIndexEntry,
  PrescriptionRecord,
  LabReportRecord,
  VaccinationRecord,
  DischargeSummaryRecord,
  MedicalCertificateRecord,
  ConsultationRecord,
} from '../types';
import { RadiologyReportRecord } from '../types/radiology';
import { VaultFileMetadata } from '../types/storage';

interface RecordDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  recordType: string;
  patientId: string;
  userRole: string;
  onStatusChanged?: () => void;
}

export function RecordDetailsDrawer({
  isOpen,
  onClose,
  recordId,
  recordType,
  patientId,
  userRole,
  onStatusChanged,
}: RecordDetailsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [indexEntry, setIndexEntry] = useState<TimelineIndexEntry | null>(null);
  const [record, setRecord] = useState<BaseVaultRecord | null>(null);
  const [files, setFiles] = useState<VaultFileMetadata[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [selectedVersionData, setSelectedVersionData] = useState<BaseVaultRecord | null>(null);
  const [loadingVersion, setLoadingVersion] = useState(false);

  const vaultService = React.useMemo(() => new HealthVaultService(), []);
  const storageService = React.useMemo(() => new StorageService(), []);

  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  // Focus restoration and Escape key listener for accessibility (WCAG 2.2 AA)
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement;
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
    }
  }, [isOpen, onClose]);

  // Fetch record details and file metadata
  useEffect(() => {
    if (!isOpen || !recordId || !recordType) return;

    const loadData = async () => {
      setLoading(true);
      setRecord(null);
      setIndexEntry(null);
      setSelectedVersion(null);
      setSelectedVersionData(null);
      setPreviewUrl(null);
      setFiles([]);

      try {
        const indexDetails = await vaultService.getTimelineIndexEntry(recordId);
        setIndexEntry(indexDetails);

        const details = await vaultService.getRecordDetails(recordType, recordId, {
          actorId: patientId,
          ownerId: patientId,
          actorRole: userRole,
        });
        setRecord(details);

        // Fetch associated file metadata from StorageRepository
        const fileList = await storageService.repository.getFileMetadataByRecordId(recordId);
        setFiles(fileList);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[RecordDetailsDrawer] Error loading record details:', msg);
        toast.error('Failed to load clinical record details.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, recordId, recordType, patientId, userRole, vaultService, storageService]);

  // Load selected version data
  const handleVersionClick = async (version: number) => {
    if (!record) return;
    if (version === record.metadata.version) {
      setSelectedVersion(null);
      setSelectedVersionData(null);
      return;
    }

    setLoadingVersion(true);
    setSelectedVersion(version);
    try {
      const data = await vaultService.getRecordVersionDetails(recordType, recordId, version);
      setSelectedVersionData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[RecordDetailsDrawer] Failed to fetch version data:', msg);
      toast.error('Failed to load version history data.');
      setSelectedVersion(null);
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      toast.info('Starting secure file download...');
      await storageService.download.downloadFile(fileId, patientId, userRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'File download failed.');
    }
  };

  const handlePreview = async (fileId: string) => {
    try {
      if (previewUrl) {
        setPreviewUrl(null);
        return;
      }
      toast.info('Generating secure preview link...');
      const url = await storageService.preview.getSecurePreviewUrl(fileId, patientId, userRole);
      setPreviewUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'Unable to render preview.');
    }
  };

  const handleArchiveToggle = async () => {
    if (!record) return;
    const isArchived = record.metadata.status === 'ARCHIVED';
    try {
      setLoading(true);
      if (isArchived) {
        await vaultService.restoreRecord(recordType, recordId, patientId, patientId, userRole);
        toast.success('Clinical record restored successfully.');
      } else {
        await vaultService.archiveRecord(recordType, recordId, patientId, patientId, userRole);
        toast.success('Clinical record archived.');
      }
      if (onStatusChanged) onStatusChanged();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || 'Failed to update record status.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentData = selectedVersionData || record;
  const isViewingHistory = selectedVersion !== null;

  const parseSafeDate = (d: unknown): Date => {
    if (!d) return new Date();
    if (typeof (d as { toDate?: () => Date }).toDate === 'function') {
      return (d as { toDate: () => Date }).toDate();
    }
    if (d instanceof Date) return d;
    return new Date(d as string | number);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 transform translate-x-0">
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              aria-label="Close details panel"
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
            >
              <icons.X className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {indexEntry?.summaryFields.title || 'Clinical Document Details'}
              </h2>
              <p className="text-xs text-slate-500 capitalize">
                Category: {recordType.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {record && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
                  record.metadata.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                )}
              >
                {record.metadata.status}
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <icons.Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500">Decrypting and loading health record details...</p>
            </div>
          ) : !record ? (
            <div className="text-center py-20 text-slate-500">
              <icons.AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p>Record details could not be found.</p>
            </div>
          ) : (
            <>
              {/* History viewing warning banner */}
              {isViewingHistory && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300 text-xs flex items-center justify-between">
                  <span>Viewing historical snapshot: <strong>Version {selectedVersion}</strong></span>
                  <button
                    onClick={() => {
                      setSelectedVersion(null);
                      setSelectedVersionData(null);
                    }}
                    className="underline font-semibold hover:text-amber-900"
                  >
                    Reset to Latest
                  </button>
                </div>
              )}

              {/* Patient and Encounter Metadata block */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 p-4">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Encounter Date</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {indexEntry?.encounterDate ? format(parseSafeDate(indexEntry.encounterDate), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Source Input</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
                    {record.metadata.source}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Doctor Provider</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {indexEntry?.summaryFields.providerName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Clinical Facility</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {indexEntry?.summaryFields.hospitalName || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Concrete Details Block based on Type */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Clinical Information
                </h3>

                {/* Prescription Details */}
                {recordType === 'prescription' && currentData && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Diagnosis:</strong> {(currentData as PrescriptionRecord).diagnosis || 'N/A'}
                    </p>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-2.5 font-semibold">Medicine Name</th>
                            <th className="p-2.5 font-semibold">Dosage</th>
                            <th className="p-2.5 font-semibold">Frequency</th>
                            <th className="p-2.5 font-semibold">Duration (Days)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {((currentData as PrescriptionRecord).medicines || []).map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">{med.name}</td>
                              <td className="p-2.5 text-slate-600">{med.dosage}</td>
                              <td className="p-2.5 text-slate-600">{med.frequency}</td>
                              <td className="p-2.5 text-slate-600">{med.durationDays}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Lab Report Details */}
                {recordType === 'lab_report' && currentData && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Laboratory Facility:</strong> {(currentData as LabReportRecord).laboratoryName || 'N/A'}
                    </p>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-2.5 font-semibold">Test Item</th>
                            <th className="p-2.5 font-semibold">Result Value</th>
                            <th className="p-2.5 font-semibold">Reference Range</th>
                            <th className="p-2.5 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {((currentData as LabReportRecord).observations || []).map((res, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">{res.parameter}</td>
                              <td className="p-2.5 text-slate-600">{res.value} {res.unit}</td>
                              <td className="p-2.5 text-slate-600">{res.referenceRange || '—'}</td>
                              <td className="p-2.5">
                                <span
                                  className={cn(
                                    'inline-block px-1.5 py-0.5 rounded text-[10px] font-bold',
                                    res.isAbnormal
                                      ? 'bg-red-50 text-red-700'
                                      : 'bg-green-50 text-green-700'
                                  )}
                                >
                                  {res.isAbnormal ? 'ABNORMAL' : 'NORMAL'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Radiology Report Details */}
                {recordType === 'radiology_report' && currentData && (
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Modality:</strong> {(currentData as RadiologyReportRecord).modality} ·{' '}
                      <strong>Body Part:</strong> {(currentData as RadiologyReportRecord).bodySite}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2.5 border border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Clinical Findings</p>
                      <p className="whitespace-pre-line text-xs font-medium text-slate-700 dark:text-slate-350">
                        {(currentData as RadiologyReportRecord).findingNotes}
                      </p>
                      
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mt-4">Diagnostic Impression</p>
                      <p className="whitespace-pre-line text-xs font-bold text-slate-900 dark:text-slate-200">
                        {(currentData as RadiologyReportRecord).impression}
                      </p>
                    </div>
                  </div>
                )}

                {/* Vaccination Details */}
                {recordType === 'vaccination' && currentData && (
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <p><strong>Vaccine Product:</strong> {(currentData as VaccinationRecord).vaccineName}</p>
                    <p><strong>Dose Number:</strong> Dose {(currentData as VaccinationRecord).doseNumber}</p>
                    <p><strong>Batch / Lot Number:</strong> {(currentData as VaccinationRecord).batchNumber || 'N/A'}</p>
                    <p><strong>Facility Administered:</strong> {(currentData as VaccinationRecord).facilityName}</p>
                    <p><strong>Administered By:</strong> {(currentData as VaccinationRecord).administeredBy}</p>
                    <p>
                      <strong>Next Scheduled Dose:</strong>{' '}
                      {(currentData as VaccinationRecord).nextDueDate ? format(parseSafeDate((currentData as VaccinationRecord).nextDueDate), 'PP') : 'N/A'}
                    </p>
                  </div>
                )}

                {/* Consultation Details */}
                {recordType === 'consultation' && currentData && (
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <p><strong>Symptoms reported:</strong> {(currentData as ConsultationRecord).symptoms?.join(', ') || 'N/A'}</p>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Clinical Encounter Notes</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{(currentData as ConsultationRecord).clinicalNotes || 'No notes added.'}</p>

                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mt-3">Treatment Plan</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{(currentData as ConsultationRecord).plan || 'None'}</p>
                    </div>
                  </div>
                )}

                {/* Discharge Summary */}
                {recordType === 'discharge_summary' && currentData && (
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Admission:</strong> {format(parseSafeDate((currentData as DischargeSummaryRecord).admissionDate), 'PP')} ·{' '}
                      <strong>Discharge:</strong> {format(parseSafeDate((currentData as DischargeSummaryRecord).dischargeDate), 'PP')}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <div>
                        <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Admitting Diagnosis</p>
                        <p className="text-xs mt-0.5 text-slate-800 dark:text-slate-200">{(currentData as DischargeSummaryRecord).admittingDiagnosis}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Treatment Summary</p>
                        <p className="text-xs mt-0.5 text-slate-750 dark:text-slate-300">{(currentData as DischargeSummaryRecord).treatmentSummary}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Discharge Condition</p>
                        <p className="text-xs mt-0.5 text-slate-800 dark:text-slate-200 font-medium">{(currentData as DischargeSummaryRecord).dischargeCondition}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Follow-up Plan</p>
                        <p className="text-xs mt-0.5 text-slate-800 dark:text-slate-200">{(currentData as DischargeSummaryRecord).followUpPlan}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical Certificate */}
                {recordType === 'medical_certificate' && currentData && (
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p><strong>Purpose of Certificate:</strong> {(currentData as MedicalCertificateRecord).purpose}</p>
                    <p>
                      <strong>Excused Period:</strong> {format(parseSafeDate((currentData as MedicalCertificateRecord).startDate), 'PP')} to{' '}
                      {format(parseSafeDate((currentData as MedicalCertificateRecord).endDate), 'PP')}
                    </p>
                    <p><strong>Diagnosis Notes:</strong> {(currentData as MedicalCertificateRecord).diagnosisNotes || 'N/A'}</p>
                  </div>
                )}
              </div>

              {/* Version History List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Document Version History
                </h3>
                <div className="flex flex-wrap gap-2">
                  {/* Create versions array */}
                  {Array.from({ length: record.metadata.version }, (_, i) => i + 1).map((ver) => (
                    <button
                      key={ver}
                      onClick={() => handleVersionClick(ver)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs font-semibold transition',
                        ver === (selectedVersion || record.metadata.version)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700 hover:bg-slate-50'
                      )}
                    >
                      v{ver} {ver === record.metadata.version ? '(Latest)' : ''}
                    </button>
                  ))}
                </div>
                {loadingVersion && (
                  <p className="text-xs text-slate-500 animate-pulse">Loading version snapshot details...</p>
                )}
              </div>

              {/* Associated Files List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Decrypted Storage Files
                </h3>
                {files.length === 0 ? (
                  <p className="text-xs text-slate-400">No storage files linked to this clinical record.</p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.fileId}
                        className="rounded-xl border border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-900/30 p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <icons.FileText className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                                {file.originalFileName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {(file.fileSize / (1024 * 1024)).toFixed(2)} MB · {file.contentType}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {storageService.preview.isSupportedPreview(file.contentType) && (
                              <button
                                onClick={() => handlePreview(file.fileId)}
                                className="p-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                              >
                                <icons.Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(file.fileId)}
                              className="p-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                            >
                              <icons.Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* File Checksum detail */}
                        <div className="text-[10px] text-slate-400 font-mono bg-white dark:bg-slate-950 p-2 rounded border border-slate-50 dark:border-slate-900">
                          <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400">SHA-256 Checksum</span>
                          {file.checksum}
                        </div>

                        {/* Inline preview iframe */}
                        {previewUrl && (
                          <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white">
                            <iframe
                              src={previewUrl}
                              className="w-full h-full"
                              title="Medical Document Preview"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Record Metadata Auditing */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-mono">
                <span className="font-bold uppercase tracking-wider block text-slate-450 mb-1">Audit Trail Information</span>
                <p>Record ID: {record.recordId}</p>
                <p>Checksum: {record.metadata.checksum}</p>
                <p>Device ID: {record.metadata.origin.deviceId}</p>
                <p>Client App: {record.metadata.origin.browser} ({record.metadata.origin.platform}) v{record.metadata.origin.appVersion}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {record && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <button
              onClick={handleArchiveToggle}
              disabled={loading}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition shadow-sm',
                record.metadata.status === 'ACTIVE'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
              )}
            >
              {record.metadata.status === 'ACTIVE' ? 'Archive Record' : 'Restore Record'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
export default RecordDetailsDrawer;
