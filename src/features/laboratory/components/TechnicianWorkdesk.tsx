'use client';

import React, { useState } from 'react';
import { useTechnicianOrders } from '../hooks/useTechnicianOrders';
import { TEST_CATALOGS, SPECIMEN_TYPES } from '../core/constants';
import { LabTestRequest, LabObservation } from '../types';
import { 
  ClipboardList, 
  FlaskConical, 
  CheckCircle, 
  Plus, 
  Trash, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface TechnicianWorkdeskProps {
  hospitalId: string;
}

export function TechnicianWorkdesk({ hospitalId }: TechnicianWorkdeskProps) {
  const { data: requests, isLoading, collectSpecimen, submitReport, isProcessing } = useTechnicianOrders(hospitalId);

  // States
  const [selectedRequest, setSelectedRequest] = useState<LabTestRequest | null>(null);
  const [activeSpecimenType, setActiveSpecimenType] = useState<string>('Blood');
  const [showSpecimenModal, setShowSpecimenModal] = useState(false);

  const [activeReportEntry, setActiveReportEntry] = useState<LabTestRequest | null>(null);
  const [observations, setObservations] = useState<Omit<LabObservation, 'status'>[]>([]);

  // Open Specimen Collection modal
  const handleOpenSpecimen = (req: LabTestRequest) => {
    setSelectedRequest(req);
    setActiveSpecimenType('Blood');
    setShowSpecimenModal(true);
  };

  // Confirm Specimen Collection
  const handleConfirmSpecimen = async () => {
    if (!selectedRequest) return;
    try {
      await collectSpecimen({
        requestId: selectedRequest.requestId,
        specimenType: activeSpecimenType,
      });
      setShowSpecimenModal(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Specimen collection failed:', err);
    }
  };

  // Initialize Report Entry Form
  const handleStartReport = (req: LabTestRequest) => {
    setActiveReportEntry(req);

    // Look up default parameters for this test name in TEST_CATALOGS
    const catalogItems = TEST_CATALOGS[req.testName] || [
      { parameter: 'General Finding', unit: 'n/a', referenceRange: 'Normal', low: 0, high: 0 }
    ];

    const initialObservations: Omit<LabObservation, 'status'>[] = catalogItems.map((item) => ({
      parameter: item.parameter,
      value: '',
      unit: item.unit,
      referenceRange: item.referenceRange,
      isAbnormal: false,
    }));

    setObservations(initialObservations);
  };

  // Handle changing an observation value
  const handleValueChange = (index: number, val: string) => {
    const updated = [...observations];
    updated[index].value = val;

    // Check catalog thresholds for auto-flagging
    const testName = activeReportEntry?.testName || '';
    const catalog = TEST_CATALOGS[testName];
    if (catalog) {
      const parameterName = updated[index].parameter;
      const rule = catalog.find((c) => c.parameter === parameterName);
      if (rule) {
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
          if (numVal < rule.low || numVal > rule.high) {
            updated[index].isAbnormal = true;
          } else {
            updated[index].isAbnormal = false;
          }
        }
      }
    }
    setObservations(updated);
  };

  // Add custom parameter
  const handleAddParameter = () => {
    setObservations([
      ...observations,
      { parameter: '', value: '', unit: '', referenceRange: '', isAbnormal: false }
    ]);
  };

  // Remove parameter
  const handleRemoveParameter = (index: number) => {
    setObservations(observations.filter((_, idx) => idx !== index));
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!activeReportEntry) return;

    // Validate that all fields are filled
    const hasEmpty = observations.some((o) => !o.parameter || !o.value);
    if (hasEmpty) {
      alert('Please fill out all parameter names and values before finalizing.');
      return;
    }

    try {
      await submitReport({
        requestId: activeReportEntry.requestId,
        technicianId: 'tech_current_user',
        technicianName: 'Lead Pathologist',
        observations,
      });
      setActiveReportEntry(null);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-semibold">Loading laboratory orders queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Upper desk actions / stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{requests?.length || 0}</h4>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Samples Collected</span>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              {requests?.filter((r) => r.status === 'sample_collected' || r.status === 'processing').length || 0}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 text-left">
          <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Reports</span>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              {requests?.filter((r) => r.status === 'completed').length || 0}
            </h4>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Orders List Queue */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-2 text-left">
            Active Pathology Queue
          </h3>
          
          <div className="space-y-3">
            {requests && requests.length > 0 ? (
              requests
                .filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
                .map((req) => (
                  <div
                    key={req.requestId}
                    className={cn(
                      'p-4 border rounded-xl space-y-3 text-left transition',
                      activeReportEntry?.requestId === req.requestId
                        ? 'border-blue-500 bg-blue-50/15 dark:bg-blue-950/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                    )}
                  >
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                        {req.patientName}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-semibold">{req.testName}</p>
                      <span
                        className={cn(
                          'inline-block text-[9px] font-bold px-1.5 py-0.5 mt-1.5 rounded uppercase border',
                          req.status === 'ordered'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
                        )}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {req.status === 'ordered' && (
                        <button
                          onClick={() => handleOpenSpecimen(req)}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition"
                        >
                          Collect Specimen
                        </button>
                      )}
                      {req.status === 'sample_collected' && (
                        <button
                          onClick={() => handleStartReport(req)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition"
                        >
                          Enter Results
                        </button>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-400 font-semibold py-8 text-center">No pending laboratory orders found.</p>
            )}
          </div>
        </div>

        {/* Action Panel: Report Compilation form */}
        <div className="lg:col-span-2 space-y-6">
          {activeReportEntry ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-555">
                    Result Entry: {activeReportEntry.testName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Patient: <span className="font-bold">{activeReportEntry.patientName}</span> · Specimen:{' '}
                    <span className="font-bold uppercase text-indigo-600">{activeReportEntry.specimenType}</span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveReportEntry(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              {/* Parameters List form */}
              <div className="space-y-4">
                {observations.map((obs, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end p-4 border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl"
                  >
                    {/* Parameter name */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Parameter
                      </label>
                      <input
                        type="text"
                        value={obs.parameter}
                        onChange={(e) => {
                          const updated = [...observations];
                          updated[index].parameter = e.target.value;
                          setObservations(updated);
                        }}
                        placeholder="e.g. Hemoglobin"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                      />
                    </div>

                    {/* Observed Value */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Observed Value
                      </label>
                      <input
                        type="text"
                        value={obs.value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        placeholder="14.5"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={obs.unit}
                        onChange={(e) => {
                          const updated = [...observations];
                          updated[index].unit = e.target.value;
                          setObservations(updated);
                        }}
                        placeholder="g/dL"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                      />
                    </div>

                    {/* Reference Range */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Reference Range
                      </label>
                      <input
                        type="text"
                        value={obs.referenceRange}
                        onChange={(e) => {
                          const updated = [...observations];
                          updated[index].referenceRange = e.target.value;
                          setObservations(updated);
                        }}
                        placeholder="13.5 - 17.5"
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none"
                      />
                    </div>

                    {/* Trash delete */}
                    <div className="sm:col-span-1 flex justify-end pb-1.5">
                      <button
                        onClick={() => handleRemoveParameter(index)}
                        className="p-2 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-400 rounded-lg transition"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Abnormal Flag Alert */}
                    {obs.isAbnormal && (
                      <div className="sm:col-span-12 mt-1 text-[10px] font-bold text-rose-650 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 animate-pulse" />
                        <span>Warning: Value is abnormal according to test catalog parameters.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center shrink-0">
                <button
                  onClick={handleAddParameter}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/25 border border-dashed border-blue-200 dark:border-blue-900 rounded-xl transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Parameter</span>
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Finalize & Sign Report
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-405 font-semibold text-xs flex flex-col items-center justify-center gap-3">
              <ClipboardList className="h-10 w-10 text-slate-350" />
              <span>Select an order from the active queue on the left to begin compiling pathology diagnostic records.</span>
            </div>
          )}
        </div>

      </div>

      {/* Specimen Collection Modal */}
      {showSpecimenModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 text-left shadow-2xl">
            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                Log Specimen Collection
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Confirm sample collection for <span className="font-bold">{selectedRequest.patientName}</span> ({selectedRequest.testName}).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Specimen/Sample Type
              </label>
              <select
                value={activeSpecimenType}
                onChange={(e) => setActiveSpecimenType(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none"
              >
                {SPECIMEN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowSpecimenModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSpecimen}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
              >
                Confirm Collection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
