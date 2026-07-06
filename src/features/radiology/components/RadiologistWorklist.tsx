'use client';

import React, { useState } from 'react';
import { useRadiologistWorklist } from '../hooks/useRadiologistWorklist';
import { RadiologyStudy } from '../types';
import { IMAGING_TEMPLATES } from '../core/constants';
import { Activity, Play, FileEdit, Database, Send, AlertTriangle, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RadiologistWorklistProps {
  hospitalId: string;
}

export function RadiologistWorklist({ hospitalId }: RadiologistWorklistProps) {
  const {
    data: studies = [],
    isLoading,
    startScan,
    completeScan,
    submitReport,
    isProcessing,
  } = useRadiologistWorklist(hospitalId);

  // Modals / Panels active state
  const [activeDicomStudy, setActiveDicomStudy] = useState<RadiologyStudy | null>(null);
  const [activeReportStudy, setActiveReportStudy] = useState<RadiologyStudy | null>(null);
  const [viewingStudy, setViewingStudy] = useState<RadiologyStudy | null>(null);

  // Form states for DICOM Ingestion
  const [seriesDescription, setSeriesDescription] = useState('Standard T2 Sagittal Scan');
  const [instancesCount, setInstancesCount] = useState(24);
  const [manufacturer, setManufacturer] = useState('GE Medical Systems');
  const [accessionNumber, setAccessionNumber] = useState('ACC-1002345');

  // Form states for Clinical Report
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');

  const handleTemplateChange = (key: string) => {
    setSelectedTemplateKey(key);
    const template = IMAGING_TEMPLATES[key];
    if (template) {
      setFindings(template.defaultFindings);
      setImpression(template.defaultImpression);
    }
  };

  const handleCompleteScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDicomStudy) return;

    // Build mock series & instances
    const series = [
      {
        seriesInstanceUid: `1.2.840.113619.2.${Date.now()}`,
        number: 1,
        modality: activeDicomStudy.modality,
        description: seriesDescription,
        numberOfInstances: instancesCount,
        instances: Array.from({ length: Math.min(instancesCount, 6) }).map((_, i) => ({
          sopInstanceUid: `1.2.840.113619.2.${Date.now()}.${i}`,
          number: i + 1,
          sopClassUid: '1.2.840.10008.5.1.4.1.1.2',
          thumbnailUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400',
        })),
      },
    ];

    const dicomMetadata = {
      manufacturer,
      accessionNumber,
      patientSex: 'M' as const,
      studyDescription: `${activeDicomStudy.modality} ${activeDicomStudy.bodySite}`,
      studyDate: new Date().toISOString().split('T')[0],
      studyTime: new Date().toTimeString().split(' ')[0],
    };

    try {
      await completeScan({
        studyInstanceUid: activeDicomStudy.studyInstanceUid,
        series,
        dicomMetadata,
      });
      setActiveDicomStudy(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportStudy) return;

    // Prepopulate 2-3 key slices for demonstration
    const keyImages = [
      {
        sopInstanceUid: activeReportStudy.series?.[0]?.instances?.[0]?.sopInstanceUid || `1.2.840.${Date.now()}.1`,
        seriesInstanceUid: activeReportStudy.series?.[0]?.seriesInstanceUid || `1.2.840.${Date.now()}.0`,
        instanceNumber: 1,
        thumbnailUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400',
        description: 'Key anatomical slice showing scan region.',
      },
    ];

    try {
      await submitReport({
        studyInstanceUid: activeReportStudy.studyInstanceUid,
        patientId: activeReportStudy.patientId,
        patientName: activeReportStudy.patientName,
        radiologistId: 'rad_expert_99',
        radiologistName: 'Dr. Sarah Jenkins, MD',
        findings,
        impression,
        isCritical,
        keyImages,
        attachmentUrl: 'https://arogyaos.gov.in/reports/mock_pathology_report.pdf',
        attachmentName: `${activeReportStudy.modality}_${activeReportStudy.bodySite}_Report.pdf`,
      });
      setActiveReportStudy(null);
      setFindings('');
      setImpression('');
      setIsCritical(false);
      setSelectedTemplateKey('');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-xs font-semibold text-slate-500">
        <Activity className="h-5 w-5 animate-spin mr-2 text-emerald-500" />
        <span>Loading radiology worklist queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Active Worklist Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-emerald-500" />
            <span>Hospital Radiology Scan Orders Queue</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 border-b border-slate-100 dark:border-slate-850">
                <th className="p-4 font-bold uppercase tracking-wide">Patient</th>
                <th className="p-4 font-bold uppercase tracking-wide">Modality / Site</th>
                <th className="p-4 font-bold uppercase tracking-wide">Status</th>
                <th className="p-4 font-bold uppercase tracking-wide">Ordering Clinician</th>
                <th className="p-4 font-bold uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {studies.length > 0 ? (
                studies.map((study) => (
                  <tr key={study.studyInstanceUid} className="hover:bg-slate-50/30">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{study.patientName}</div>
                      <div className="text-[10px] text-slate-450 font-mono">ID: {study.patientId}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900 uppercase">
                          {study.modality}
                        </span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-150">
                          {study.bodySite}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border',
                          study.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-750 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-450'
                            : study.status === 'in-progress'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
                            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400'
                        )}
                      >
                        {study.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{study.referredBy}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        
                        {/* Start Scan */}
                        {(study.status === 'registered' || study.status === 'scheduled') && (
                          <button
                            onClick={() => startScan(study.studyInstanceUid)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-sm"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Start Scan</span>
                          </button>
                        )}

                        {/* Complete Scan (DICOM upload) */}
                        {study.status === 'in-progress' && (
                          <button
                            onClick={() => setActiveDicomStudy(study)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition shadow-sm"
                          >
                            <Database className="h-3.5 w-3.5" />
                            <span>Complete & DICOM</span>
                          </button>
                        )}

                        {/* Write Findings Report */}
                        {study.status === 'completed' && !study.reportId && (
                          <button
                            onClick={() => {
                              setActiveReportStudy(study);
                              // Reset states
                              setFindings('');
                              setImpression('');
                              setIsCritical(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition shadow-sm"
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                            <span>Write Report</span>
                          </button>
                        )}

                        {/* View summary (if completed and has report) */}
                        {study.reportId && (
                          <button
                            onClick={() => setViewingStudy(study)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-bold transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Report</span>
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-450 font-semibold bg-slate-50/20 dark:bg-slate-900/5">
                    No active imaging orders in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: DICOM Ingestion / Scan Completion */}
      {activeDicomStudy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-left">
            <div className="px-5 py-4 border-b border-slate-150 dark:border-slate-850">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                Log Scan Completion & Ingest DICOM Metadata
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                Study UID: {activeDicomStudy.studyInstanceUid}
              </p>
            </div>

            <form onSubmit={handleCompleteScanSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-650">Series Description</label>
                <input
                  type="text"
                  value={seriesDescription}
                  onChange={(e) => setSeriesDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Instances / Slices count</label>
                  <input
                    type="number"
                    value={instancesCount}
                    onChange={(e) => setInstancesCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-650">Scanner Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650">Accession Number</label>
                <input
                  type="text"
                  value={accessionNumber}
                  onChange={(e) => setAccessionNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveDicomStudy(null)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
                >
                  Complete Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Write Clinical Findings Report */}
      {activeReportStudy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="px-5 py-4 border-b border-slate-150 dark:border-slate-850 flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  Write Diagnostic Radiology Report
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                  Patient: {activeReportStudy.patientName} · {activeReportStudy.modality} {activeReportStudy.bodySite}
                </p>
              </div>
              
              {/* Select template dropdown */}
              <select
                value={selectedTemplateKey}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-bold focus:outline-none"
              >
                <option value="">Choose Template</option>
                {Object.keys(IMAGING_TEMPLATES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleReportSubmit} className="p-5 space-y-4.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-650">Clinical Findings Notes</label>
                <textarea
                  rows={4}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Describe scan observations in detail..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650">Diagnostic Impression Summary</label>
                <input
                  type="text"
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Final impression (e.g. Normal Scan, Mild effusion)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Critical finding trigger */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/40 dark:bg-amber-950/10 rounded-xl border border-amber-200/30">
                <div className="space-y-0.5 pr-2">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Flag Critical Finding</span>
                  </div>
                  <p className="text-[10px] text-slate-450">
                    Triggers global critical alert bus notifications for the referring physician.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4.5 w-4.5 bg-white cursor-pointer"
                />
              </div>

              {/* Pathologist credential footer */}
              <p className="text-[10px] font-mono text-slate-450 italic">
                Report will be signed off by: Dr. Sarah Jenkins, MD (Radiology Registrar)
              </p>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveReportStudy(null)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Sign & Authorize Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: View finalized report details */}
      {viewingStudy && viewingStudy.reportId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-left">
            <div className="px-5 py-4 border-b border-slate-150 dark:border-slate-850">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                Finalized Diagnostic Report Summary
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                Study UID: {viewingStudy.studyInstanceUid}
              </p>
            </div>
            
            <div className="p-5 space-y-4 text-xs text-slate-850 dark:text-slate-250 leading-relaxed">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Findings</span>
                <p className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850 mt-1">
                  {viewingStudy.report?.findings || 'No notes available'}
                </p>
              </div>
              
              <div>
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Impression</span>
                <p className="bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 p-3 rounded-lg font-bold border border-emerald-100/30 mt-1">
                  {viewingStudy.report?.impression || 'No impression summary'}
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setViewingStudy(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default RadiologistWorklist;
