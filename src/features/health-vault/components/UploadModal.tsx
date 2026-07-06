'use client';

import React, { useState, useRef } from 'react';
import { icons } from '@/design-system/icons';
import { HealthVaultService } from '../services/HealthVaultService';
import { UploadService } from '../services/UploadService';
import { VaultSource } from '../core/constants';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onUploadSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, patientId, onUploadSuccess }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [recordType, setRecordType] = useState('prescription');
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [encounterDate, setEncounterDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const vaultService = React.useMemo(() => new HealthVaultService(), []);
  const uploadService = React.useMemo(() => new UploadService(), []);

  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  // Focus restoration and Escape key listener for accessibility (WCAG 2.2 AA)
  React.useEffect(() => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !doctorName || !hospitalName || !encounterDate) {
      toast.error('Please enter all required clinical metadata fields.');
      return;
    }

    if (!file) {
      toast.error('Please select or drag-and-drop a file to upload.');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // 1. Prepare record type payload details — must satisfy Omit<BaseVaultRecord, 'recordId' | 'metadata'>
      const basePayload = {
        ownerId: patientId,
        title,
        providerName: doctorName,
        hospitalName,
        encounterDate: new Date(encounterDate),
      };

      let recordPayload: Record<string, unknown> = { ...basePayload };

      if (recordType === 'prescription') {
        recordPayload = {
          ...basePayload,
          diagnosis: 'Patient upload of prescription records.',
          medicines: [],
        };
      } else if (recordType === 'lab_report') {
        recordPayload = {
          ...basePayload,
          laboratoryName: hospitalName,
          observations: [],
        };
      } else if (recordType === 'radiology_report') {
        recordPayload = {
          ...basePayload,
          modality: 'X-RAY',
          bodySite: 'General',
          findingNotes: 'Self-reported document',
          impression: 'Unverified self-upload',
          studyType: 'General',
          radiologistId: '',
          radiologistName: '',
        };
      }

      // 2. Ingest medical record (payload is shaped by the concrete repository)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recordId = await vaultService.ingestRecord(recordType as string, recordPayload as any, {
        ownerId: patientId,
        createdBy: patientId,
        source: 'PATIENT_UPLOAD' as VaultSource,
        encounterDate: new Date(encounterDate),
        origin: {
          deviceId: 'client-browser-agent',
          deviceType: 'DESKTOP',
          platform: navigator.platform || 'web',
          browser: 'Browser',
          appVersion: '1.0.0',
        },
        summaryFields: {
          title,
          providerName: doctorName,
          hospitalName,
        },
      });

      // 3. Initiate secure file upload linked to ingested record ID
      await uploadService.startUpload(
        file,
        {
          ownerId: patientId,
          recordId,
          recordType,
          uploadedBy: patientId,
        },
        {
          onProgress: (p) => {
            setProgress(Math.round(p));
          },
          onComplete: () => {
            toast.success('Document uploaded and indexed successfully.');
            setLoading(false);
            if (onUploadSuccess) onUploadSuccess();
            onClose();
          },
          onError: (err) => {
            toast.error(`Upload error: ${err.message}`);
            setLoading(false);
          },
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[UploadModal] Ingestion failed:', msg);
      toast.error(msg || 'Failed to ingest record metadata.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 id="upload-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <icons.UploadCloud className="h-5 w-5 text-blue-600" />
            Upload Clinical Record
          </h2>
          <button
            onClick={onClose}
            aria-label="Close upload modal"
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          >
            <icons.X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Record type and Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="record-type" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Record Category
              </label>
              <select
                id="record-type"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="prescription">Prescription</option>
                <option value="lab_report">Laboratory Report</option>
                <option value="radiology_report">Radiology Report</option>
                <option value="vaccination">Vaccination Record</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="medical_certificate">Medical Certificate</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            <div>
              <label htmlFor="record-title" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Record Title
              </label>
              <input
                id="record-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Blood Panel"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Clinician and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="record-doctor" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Prescribing Doctor
              </label>
              <input
                id="record-doctor"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. John Doe"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>
            <div>
              <label htmlFor="record-hospital" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Hospital / Clinic
              </label>
              <input
                id="record-hospital"
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="City General Hospital"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Encounter Date */}
          <div>
            <label htmlFor="record-date" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Date of Encounter
            </label>
            <input
              id="record-date"
              type="date"
              value={encounterDate}
              onChange={(e) => setEncounterDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          {/* Drag and Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center',
              file
                ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
            />
            {file ? (
              <div className="space-y-2">
                <icons.FileText className="h-10 w-10 text-blue-600 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{file.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelFile();
                  }}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <icons.UploadCloud className="h-10 w-10 text-slate-350 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to select file or drag & drop here
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PDF, PNG, JPG, WEBP, and TXT up to 50 MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Encrypting and uploading file...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-600/10"
            >
              Start Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default UploadModal;
