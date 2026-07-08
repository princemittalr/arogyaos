'use client';

import React, { useState } from 'react';
import { X, RefreshCw, ShieldCheck } from 'lucide-react';
import { useRefillTracker } from '../hooks/useRefillTracker';
import { PrescriptionRecord } from '../types';
import { Textarea } from '@/components/ui/input';


interface RefillRequestModalProps {
  prescription: PrescriptionRecord;
  uid: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefillRequestModal({
  prescription,
  uid,
  onClose,
  onSuccess,
}: RefillRequestModalProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState('hosp_city_gen');
  const quantity = 1;
  const [notes, setNotes] = useState('');

  const { requestRefill, isRequesting } = useRefillTracker(prescription.recordId);

  // List of pharmacies for seeding selection
  const pharmacies = [
    { id: 'hosp_city_gen', name: 'City General Hospital Pharmacy' },
    { id: 'hosp_st_marys', name: 'St. Marys Healthcare Pharmacy' },
    { id: 'hosp_arogya', name: 'Arogya Wellness Centre Pharmacy' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pharMatch = pharmacies.find((p) => p.id === selectedPharmacy);
    
    try {
      await requestRefill(
        quantity,
        uid,
        selectedPharmacy,
        pharMatch?.name || 'ArogyaOS Partner Pharmacy',
        notes
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const remaining = prescription.refillsRemaining !== undefined 
    ? prescription.refillsRemaining 
    : prescription.refillsAllowed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Request Medication Refill
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Info Card */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-2">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prescription Details</p>
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">
              {prescription.diagnosis}
            </h4>
            <div className="flex justify-between items-center text-xs pt-1.5">
              <span className="text-slate-500 font-bold">Refills Remaining:</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
                {remaining} of {prescription.refillsAllowed}
              </span>
            </div>
          </div>

          {/* Pharmacy Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Select Dispensing Pharmacy
            </label>
            <select
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Notes to Pharmacist (Optional)
            </label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., I'll pick this up tomorrow afternoon..."
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Safe Check Notice */}
          <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl text-xs text-blue-650 dark:text-blue-350 border border-blue-100 dark:border-blue-900/40">
            <ShieldCheck className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">
              This request will be queued in the national digital health grid. Refills are validated against doctor authorizing limits and chemical schedule constraints.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isRequesting}
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRequesting}
              className="px-4 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-550/20 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequesting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Refill Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RefillRequestModal;
