'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Search, Clock, CheckCircle2,
  FileText, ChevronRight, Syringe, Calendar, BarChart2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Vaccination, VaccinationCertificate, VaccineCategory, VaccinationStatus } from '../types';
import { VACCINE_CATEGORIES, VACCINATION_STATUSES } from '../core/constants';
import { VaccineDetailDrawer } from './VaccineDetailDrawer';
import { CertificateViewer } from './CertificateViewer';
import { useVaccinations } from '../hooks/useVaccinations';
import { useUpcomingVaccines } from '../hooks/useUpcomingVaccines';
import { useVaccinationCertificates } from '../hooks/useVaccinationCertificates';
import { useVaccinationTimeline } from '../hooks/useVaccinationTimeline';
import { useBoosterTracker } from '../hooks/useBoosterTracker';
import { Input } from '@/components/ui/input';


interface VaccinationRegistryProps {
  patientId: string;
  patientName: string;
}

const STATUS_COLORS: Record<VaccinationStatus, string> = {
  administered: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
  verified: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
  scheduled: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
  due: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
  missed: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50',
  delayed: 'bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900/50',
  cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  refused: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  expired: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
};

const TIMELINE_ICON_COLORS: Record<string, string> = {
  administered: 'bg-blue-500',
  verified: 'bg-emerald-500',
  scheduled: 'bg-indigo-500',
  adverse_event: 'bg-red-500',
  certificate_generated: 'bg-amber-500',
};

type ActiveView = 'registry' | 'timeline' | 'certificates' | 'upcoming';

export function VaccinationRegistry({ patientId, patientName }: VaccinationRegistryProps) {
  const [activeView, setActiveView] = useState<ActiveView>('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VaccineCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<VaccinationStatus | 'ALL'>('ALL');
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<VaccinationCertificate | null>(null);

  const { vaccinations, isLoading, recordAdverseEvent, isProcessing } = useVaccinations(patientId);
  const { schedules, isLoading: schedulesLoading } = useUpcomingVaccines(patientId);
  const { certificates, isLoading: certsLoading } = useVaccinationCertificates(patientId);
  const { events, isLoading: timelineLoading } = useVaccinationTimeline(patientId);
  const { upcomingBoosters } = useBoosterTracker(patientId);

  const stats = useMemo(() => ({
    total: vaccinations.length,
    administered: vaccinations.filter((v) => v.status === 'administered').length,
    verified: vaccinations.filter((v) => v.status === 'verified').length,
    upcoming: schedules.length,
    boosters: upcomingBoosters.length,
    certificates: certificates.length,
  }), [vaccinations, schedules, upcomingBoosters, certificates]);

  const filtered = useMemo(() => {
    return vaccinations.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.vaccineName.toLowerCase().includes(q) ||
        v.diseaseTargeted.toLowerCase().includes(q) ||
        (v.manufacturer || '').toLowerCase().includes(q) ||
        (v.batchNumber || '').toLowerCase().includes(q) ||
        (v.administeredBy || '').toLowerCase().includes(q) ||
        (v.facilityName || '').toLowerCase().includes(q) ||
        (v.certificateId || '').toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [vaccinations, searchQuery, selectedCategory, selectedStatus]);

  const viewTabs: { id: ActiveView; label: string; count?: number }[] = [
    { id: 'registry', label: 'All Vaccines', count: vaccinations.length },
    { id: 'upcoming', label: 'Upcoming / Due', count: schedules.length },
    { id: 'timeline', label: 'Timeline' },
    { id: 'certificates', label: 'Certificates', count: certificates.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
              <Syringe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Vaccination & Immunization
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete immunization history for {patientName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total Doses', value: stats.total, icon: Syringe, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
          { label: 'Administered', value: stats.administered, icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Verified', value: stats.verified, icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Boosters Due', value: stats.boosters, icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: 'Certificates', value: stats.certificates, icon: FileText, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className={cn('inline-flex p-1.5 rounded-lg mb-2', kpi.bg)}>
              <kpi.icon className={cn('h-3.5 w-3.5', kpi.color)} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200',
              activeView === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 text-[9px] font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* REGISTRY VIEW */}
      {activeView === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by vaccine, disease, manufacturer, batch, facility..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as VaccineCategory | 'ALL')}
                className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="ALL">All Categories</option>
                {(Object.entries(VACCINE_CATEGORIES) as [VaccineCategory, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as VaccinationStatus | 'ALL')}
                className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="ALL">All Statuses</option>
                {(Object.entries(VACCINATION_STATUSES) as [VaccinationStatus, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vaccination List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Syringe className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No vaccination records found</p>
              <p className="text-xs text-slate-400 mt-1">Your immunization history will appear here.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((vac) => (
                <button
                  key={vac.vaccinationId}
                  onClick={() => setSelectedVaccination(vac)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition group"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center flex-shrink-0">
                    <Syringe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate">{vac.vaccineName}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {vac.diseaseTargeted} · Dose {vac.doseNumber}/{vac.totalDoses}
                      {vac.facilityName ? ` · ${vac.facilityName}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize',
                        STATUS_COLORS[vac.status]
                      )}
                    >
                      {VACCINATION_STATUSES[vac.status]}
                    </span>
                    {vac.administeredAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(vac.administeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UPCOMING VIEW */}
      {activeView === 'upcoming' && (
        <div className="space-y-3">
          {schedulesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No upcoming vaccinations</p>
              <p className="text-xs text-slate-400 mt-1">Scheduled doses will appear here.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {schedules.map((sched) => {
                const isPast = new Date(sched.dueDate) < new Date();
                return (
                  <div key={sched.scheduleId} className="flex items-center gap-4 p-4">
                    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', isPast ? 'bg-red-50 dark:bg-red-950/20' : 'bg-amber-50 dark:bg-amber-950/20')}>
                      <Clock className={cn('h-5 w-5', isPast ? 'text-red-500' : 'text-amber-500')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate">{sched.vaccineName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dose {sched.doseNumber}/{sched.totalDoses} · {sched.diseaseTargeted}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('text-sm font-bold', isPast ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>
                        {isPast ? 'Overdue' : 'Due'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(sched.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TIMELINE VIEW */}
      {activeView === 'timeline' && (
        <div className="space-y-4">
          {timelineLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <BarChart2 className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No timeline events yet</p>
            </div>
          ) : (
            <div className="relative space-y-0 pl-8">
              {/* Vertical line */}
              <div className="absolute left-3 top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-800" />
              {events.map((event, idx) => (
                <div key={event.id} className={cn('relative pb-6', idx === events.length - 1 && 'pb-0')}>
                  {/* Dot */}
                  <div
                    className={cn(
                      'absolute -left-5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950 shadow-sm',
                      TIMELINE_ICON_COLORS[event.type] || 'bg-slate-400'
                    )}
                  />
                  {/* Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-50 text-sm">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                        {event.facilityName && (
                          <p className="text-[10px] text-slate-400 mt-1">{event.facilityName}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                        {event.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CERTIFICATES VIEW */}
      {activeView === 'certificates' && (
        <div className="space-y-3">
          {certsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <FileText className="h-10 w-10 text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No certificates generated yet</p>
              <p className="text-xs text-slate-400 mt-1">Certificates are issued after provider verification.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {certificates.map((cert) => (
                <button
                  key={cert.certificateId}
                  onClick={() => setViewingCertificate(cert)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition group"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-50 text-sm">{cert.vaccineName}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{cert.certificateNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-900/50">
                      VERIFIED
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(cert.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition flex-shrink-0" />
                </button>
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
          isProcessing={isProcessing}
        />
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <CertificateViewer
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
}
