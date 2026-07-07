'use client';

import React, { useState } from 'react';
import { X, Calendar, ShieldAlert, AlertCircle, Clock } from 'lucide-react';
import { Vaccination } from '../types';

interface VaccineDetailDrawerProps {
  vaccination: Vaccination;
  onClose: () => void;
  onRecordAdverseEvent?: (adverseEvent: {
    symptoms: string;
    severity: 'mild' | 'moderate' | 'severe';
    actionTaken?: string;
    reporterName: string;
  }) => Promise<void>;
  onVerify?: () => Promise<void>;
  isProcessing?: boolean;
}

export function VaccineDetailDrawer({
  vaccination,
  onClose,
  onRecordAdverseEvent,
  onVerify,
  isProcessing = false,
}: VaccineDetailDrawerProps) {
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [actionTaken, setActionTaken] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [showLogAEForm, setShowLogAEForm] = useState(false);

  const handleSubmitAdverseEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onRecordAdverseEvent || !symptoms.trim() || !reporterName.trim()) return;

    try {
      await onRecordAdverseEvent({
        symptoms,
        severity,
        actionTaken: actionTaken.trim() || undefined,
        reporterName,
      });
      setShowLogAEForm(false);
      setSymptoms('');
      setActionTaken('');
      setReporterName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{vaccination.vaccineName}</h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
              Dose {vaccination.doseNumber} of {vaccination.totalDoses}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                vaccination.status === 'verified'
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                  : vaccination.status === 'administered'
                  ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
              }`}
            >
              {vaccination.status}
            </span>
            <span className="text-xs text-slate-400">Target Disease: {vaccination.diseaseTargeted}</span>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold">Manufacturer</p>
              <p className="font-semibold text-slate-700 dark:text-slate-350">{vaccination.manufacturer || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Batch / Lot Number</p>
              <p className="font-semibold text-slate-700 dark:text-slate-350 font-mono">
                {vaccination.batchNumber || 'N/A'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-xs text-slate-400 font-semibold">Administered By</p>
              <p className="font-semibold text-slate-700 dark:text-slate-350">{vaccination.administeredBy || 'N/A'}</p>
            </div>
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-xs text-slate-400 font-semibold">Facility Name</p>
              <p className="font-semibold text-slate-700 dark:text-slate-350 truncate">
                {vaccination.facilityName || 'N/A'}
              </p>
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Immunization Dates</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>
                  Administered On:{' '}
                  <strong>
                    {vaccination.administeredAt
                      ? new Date(vaccination.administeredAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </strong>
                </span>
              </div>
              {vaccination.nextDueDate && (
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    Next Dose Due:{' '}
                    <strong>
                      {new Date(vaccination.nextDueDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {vaccination.notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-semibold">Clinical Notes</h3>
              <p className="text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-slate-650 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{vaccination.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Adverse Event Details */}
          {vaccination.adverseEvent ? (
            <div className="border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>Adverse Event Reported ({vaccination.adverseEvent.severity.toUpperCase()})</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Symptoms: <strong>{vaccination.adverseEvent.symptoms}</strong>
              </p>
              {vaccination.adverseEvent.actionTaken && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Action Taken: <strong>{vaccination.adverseEvent.actionTaken}</strong>
                </p>
              )}
              <p className="text-[10px] text-slate-400">
                Reported by {vaccination.adverseEvent.reporterName} on{' '}
                {new Date(vaccination.adverseEvent.reportedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            onRecordAdverseEvent && (
              <div className="pt-2">
                {!showLogAEForm ? (
                  <button
                    onClick={() => setShowLogAEForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-950 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-sm font-bold transition"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Report Adverse Reaction
                  </button>
                ) : (
                  <form onSubmit={handleSubmitAdverseEvent} className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Log Adverse Event
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowLogAEForm(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Describe Symptoms</label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g. High fever, swelling at injection site, rash"
                        rows={2}
                        required
                        className="w-full text-sm rounded-lg border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium">Severity</label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                          className="w-full text-xs rounded-lg border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-100"
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-medium">Reporter Name</label>
                        <input
                          type="text"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          placeholder="Reporter / Caregiver name"
                          required
                          className="w-full text-xs rounded-lg border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Medical Intervention / Action Taken (Optional)</label>
                      <input
                        type="text"
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="e.g. Paracetamol administered"
                        className="w-full text-xs rounded-lg border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full inline-flex justify-center items-center py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      {isProcessing ? 'Submitting...' : 'Submit Adverse Event'}
                    </button>
                  </form>
                )}
              </div>
            )
          )}
        </div>

        {/* Verification Button for Providers */}
        {vaccination.status === 'administered' && onVerify && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={onVerify}
              disabled={isProcessing}
              className="w-full inline-flex justify-center items-center py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-emerald-500/10"
            >
              {isProcessing ? 'Verifying & Generating Certificate...' : 'Verify Immunization & Sign Certificate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
