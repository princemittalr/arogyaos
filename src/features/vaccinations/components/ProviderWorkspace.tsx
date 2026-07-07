'use client';

import React, { useState } from 'react';
import { Syringe, ShieldCheck, Plus, Search, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Vaccination, VaccineCategory } from '../types';
import { VACCINE_DEFINITIONS, VACCINE_CATEGORIES } from '../core/constants';
import { VaccineDetailDrawer } from './VaccineDetailDrawer';
import { useVaccinations } from '../hooks/useVaccinations';
import { useUpcomingVaccines } from '../hooks/useUpcomingVaccines';

interface ProviderWorkspaceProps {
  hospitalId: string;
  hospitalName: string;
}

interface AdministerFormState {
  patientId: string;
  patientName: string;
  vaccineName: string;
  diseaseTargeted: string;
  category: VaccineCategory;
  doseNumber: number;
  totalDoses: number;
  administeredBy: string;
  batchNumber: string;
  lotNumber: string;
  manufacturer: string;
  nextDueDays: string;
  notes: string;
}

const DEFAULT_FORM: AdministerFormState = {
  patientId: '',
  patientName: '',
  vaccineName: '',
  diseaseTargeted: '',
  category: 'childhood',
  doseNumber: 1,
  totalDoses: 1,
  administeredBy: '',
  batchNumber: '',
  lotNumber: '',
  manufacturer: '',
  nextDueDays: '',
  notes: '',
};

export function ProviderWorkspace({ hospitalName }: ProviderWorkspaceProps) {
  const [searchPatientId, setSearchPatientId] = useState('');
  const [activePatientId, setActivePatientId] = useState('');
  const [form, setForm] = useState<AdministerFormState>(DEFAULT_FORM);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifierName, setVerifierName] = useState('');

  const { vaccinations, isLoading, administerVaccine, verifyVaccine, recordAdverseEvent, isProcessing } =
    useVaccinations(activePatientId);
  const { schedules } = useUpcomingVaccines(activePatientId);

  const handleVaccineDefinitionSelect = (code: string) => {
    const def = VACCINE_DEFINITIONS.find((d) => d.code === code);
    if (!def) return;
    setForm((prev) => ({
      ...prev,
      vaccineName: def.name,
      diseaseTargeted: def.diseaseTargeted,
      category: def.category,
      totalDoses: def.totalDoses,
      manufacturer: def.manufacturerDefault || '',
    }));
  };

  const handleSubmitAdminister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.vaccineName) return;

    const nextDueDate = form.nextDueDays
      ? new Date(Date.now() + Number(form.nextDueDays) * 86400000)
      : undefined;

    await administerVaccine({
      vaccination: {
        patientId: form.patientId,
        patientName: form.patientName,
        ownerId: form.patientId,
        vaccineName: form.vaccineName,
        diseaseTargeted: form.diseaseTargeted,
        category: form.category,
        doseNumber: form.doseNumber,
        totalDoses: form.totalDoses,
        administeredBy: form.administeredBy,
        facilityName: hospitalName,
        batchNumber: form.batchNumber || undefined,
        lotNumber: form.lotNumber || undefined,
        manufacturer: form.manufacturer || undefined,
        nextDueDate,
        notes: form.notes || undefined,
        administeredAt: new Date(),
      },
    });

    setForm(DEFAULT_FORM);
    setShowForm(false);
    if (form.patientId !== activePatientId) setActivePatientId(form.patientId);
  };

  const handleVerify = async (vaccinationId: string) => {
    if (!verifierName.trim()) return;
    await verifyVaccine({ vaccinationId, verifierSignature: verifierName });
    setVerifyingId(null);
    setVerifierName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
            <Syringe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Vaccination Workstation</h1>
            <p className="text-xs text-slate-500 mt-0.5">{hospitalName} · Provider Workspace</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Record Vaccination
        </button>
      </div>

      {/* Patient Lookup */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchPatientId}
            onChange={(e) => setSearchPatientId(e.target.value)}
            placeholder="Enter Patient ID to load immunization history..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <button
          onClick={() => setActivePatientId(searchPatientId.trim())}
          disabled={!searchPatientId.trim()}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold transition disabled:opacity-40"
        >
          Load Patient
        </button>
      </div>

      {/* Upcoming Schedules */}
      {activePatientId && schedules.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-950 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
            Pending Scheduled Doses for {activePatientId}
          </h3>
          <div className="space-y-2">
            {schedules.slice(0, 3).map((s) => (
              <div key={s.scheduleId} className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-950 rounded-lg p-2.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {s.vaccineName} (Dose {s.doseNumber}/{s.totalDoses})
                </span>
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  Due: {new Date(s.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Administration Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Record Vaccine Administration</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitAdminister} className="p-6 space-y-5">
            {/* Quick-select vaccine definition */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Quick-Select Vaccine Template</label>
              <div className="relative">
                <select
                  onChange={(e) => handleVaccineDefinitionSelect(e.target.value)}
                  defaultValue=""
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-700 dark:text-slate-300 appearance-none pr-8"
                >
                  <option value="" disabled>Choose a vaccine definition...</option>
                  {VACCINE_DEFINITIONS.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Patient */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Patient ID *</label>
                <input
                  type="text"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  placeholder="e.g. pat_abc123"
                  required
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Patient Name *</label>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  placeholder="Full name"
                  required
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Vaccine Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Vaccine Name *</label>
                <input
                  type="text"
                  value={form.vaccineName}
                  onChange={(e) => setForm({ ...form, vaccineName: e.target.value })}
                  required
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Disease Targeted *</label>
                <input
                  type="text"
                  value={form.diseaseTargeted}
                  onChange={(e) => setForm({ ...form, diseaseTargeted: e.target.value })}
                  required
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Category & Dose */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as VaccineCategory })}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300"
                >
                  {(Object.entries(VACCINE_CATEGORIES) as [VaccineCategory, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Dose Number *</label>
                <input
                  type="number"
                  min={1}
                  value={form.doseNumber}
                  onChange={(e) => setForm({ ...form, doseNumber: Number(e.target.value) })}
                  required
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Total Doses *</label>
                <input
                  type="number"
                  min={1}
                  value={form.totalDoses}
                  onChange={(e) => setForm({ ...form, totalDoses: Number(e.target.value) })}
                  required
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Batch / Lot / Manufacturer */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Batch Number</label>
                <input
                  type="text"
                  value={form.batchNumber}
                  onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
                  placeholder="e.g. BN-20261"
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Lot Number</label>
                <input
                  type="text"
                  value={form.lotNumber}
                  onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                  placeholder="e.g. LT-9821"
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Manufacturer</label>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  placeholder="e.g. Serum Institute"
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Administrator & Next Dose */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Administered By (Provider)</label>
                <input
                  type="text"
                  value={form.administeredBy}
                  onChange={(e) => setForm({ ...form, administeredBy: e.target.value })}
                  placeholder="Dr. / Nurse name"
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Next Dose Due (Days from Today)</label>
                <input
                  type="number"
                  min={1}
                  value={form.nextDueDays}
                  onChange={(e) => setForm({ ...form, nextDueDays: e.target.value })}
                  placeholder="e.g. 30"
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Clinical Notes (Optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Any additional observations..."
                className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-60 inline-flex justify-center items-center gap-2"
            >
              {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Recording...</> : 'Record Administration & Ingest to Health Vault'}
            </button>
          </form>
        </div>
      )}

      {/* Patient Vaccination List */}
      {activePatientId && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Vaccination History — {activePatientId}
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : vaccinations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No vaccination records for this patient.</p>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {vaccinations.map((vac) => (
                <div key={vac.vaccinationId} className="flex items-center gap-4 p-4">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center flex-shrink-0">
                    <Syringe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-50 text-xs">{vac.vaccineName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dose {vac.doseNumber}/{vac.totalDoses} · {vac.diseaseTargeted}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold border capitalize',
                      vac.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50' :
                      vac.status === 'administered' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50' :
                      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    )}>
                      {vac.status}
                    </span>

                    {vac.status === 'administered' && (
                      <>
                        {verifyingId === vac.vaccinationId ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={verifierName}
                              onChange={(e) => setVerifierName(e.target.value)}
                              placeholder="Verifier name"
                              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 w-28"
                            />
                            <button
                              onClick={() => handleVerify(vac.vaccinationId)}
                              disabled={isProcessing || !verifierName.trim()}
                              className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                            >
                              {isProcessing ? '...' : 'Sign'}
                            </button>
                            <button onClick={() => setVerifyingId(null)} className="text-xs text-slate-400">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setVerifyingId(vac.vaccinationId)}
                            className="text-xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold border border-emerald-200 dark:border-emerald-950 transition inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="h-3 w-3" />
                            Verify
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setSelectedVaccination(vac)}
                      className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold border border-slate-200 dark:border-slate-700 transition"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedVaccination && (
        <VaccineDetailDrawer
          vaccination={selectedVaccination}
          onClose={() => setSelectedVaccination(null)}
          onRecordAdverseEvent={async (ae) => {
            await recordAdverseEvent({
              vaccinationId: selectedVaccination.vaccinationId,
              adverseEvent: { ...ae, reportedAt: new Date() },
            });
            setSelectedVaccination(null);
          }}
          onVerify={
            selectedVaccination.status === 'administered'
              ? async () => {
                  const sig = prompt('Enter verifier name for certificate signature:');
                  if (!sig) return;
                  await verifyVaccine({
                    vaccinationId: selectedVaccination.vaccinationId,
                    verifierSignature: sig,
                  });
                  setSelectedVaccination(null);
                }
              : undefined
          }
          isProcessing={isProcessing}
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-medium">
        {[
          { color: 'bg-blue-500', label: 'Administered' },
          { color: 'bg-emerald-500', label: 'Verified & Certified' },
          { color: 'bg-amber-500', label: 'Due / Pending' },
          { color: 'bg-red-500', label: 'Missed / Overdue' },
          { color: 'bg-slate-400', label: 'Cancelled / Refused' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', l.color)} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
