'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { MousePointer2 } from 'lucide-react';
import { isDemoUser } from '@/config/demoAccounts';
import { useStateModuleData } from '@/features/state/hooks/useStateModuleData';
import { StateDistrictNode } from '@/features/state/services/StateMockData';
import dynamic from 'next/dynamic';
import { cn } from '@/utils/cn';
import Link from 'next/link';

const InteractiveStateMap = dynamic(() => import('@/features/state/components/InteractiveStateMap'), { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" /> });

const MetricCard = ({ label, value, subtext, icon: Icon, color = 'blue' }: any) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {subtext && <p className="mt-1 text-xs font-medium text-slate-500">{subtext}</p>}
        </div>
        <div className={cn('rounded-xl p-3', colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default function StateDashboardPage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useStateModuleData(user?.uid || '');
  const [selectedDistrict, setSelectedDistrict] = useState<StateDistrictNode | null>(null);

  if (isLoading) return <LoadingState />;

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="State Command Center" description="Overview of statewide healthcare metrics, infrastructure, and disease surveillance." />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={icons.Map}
            title="Awaiting State Integration"
            description="Your account is not connected to any active state-level health databases. Contact administration."
          />
        </div>
      </div>
    );
  }

  const { districts, metrics } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="State Command Center" description="Real-time surveillance and infrastructure management." />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400 text-xs font-bold shrink-0">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Districts" value={metrics.totalDistricts} subtext={`${metrics.criticalDistricts} Critical`} icon={icons.Map} color="blue" />
        <MetricCard label="Hospitals & Clinics" value={metrics.totalHospitals + metrics.totalPHCs + metrics.totalCHCs} subtext={`${metrics.totalHospitals} Hospitals, ${metrics.totalPHCs} PHCs`} icon={icons.Building2} color="indigo" />
        <MetricCard label="Bed Occupancy" value={Math.round((metrics.occupiedBeds / metrics.totalBeds) * 100) + '%'} subtext={`${metrics.occupiedBeds} / ${metrics.totalBeds} Used`} icon={icons.Bed} color={metrics.occupiedBeds / metrics.totalBeds > 0.8 ? 'red' : 'amber'} />
        <MetricCard label="Active Doctors" value={metrics.presentDoctors} subtext={`${metrics.totalDoctors} Total Registered`} icon={icons.UserCheck} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col h-[500px] rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden p-1">
          <InteractiveStateMap districts={districts} onDistrictClick={setSelectedDistrict} selectedDistrict={selectedDistrict} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <icons.MapPin className="h-4 w-4 text-blue-500" />
              {selectedDistrict ? `${selectedDistrict.name} District` : 'State Overview'}
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {selectedDistrict ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-center mb-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Status</div>
                    <div className="flex justify-center">
                      <span className={cn('h-3 w-3 rounded-full', selectedDistrict.status === 'green' ? 'bg-emerald-500' : selectedDistrict.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500')} />
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Medicine Stock</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedDistrict.medicineStock}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Hospitals</span>
                    <span className="font-semibold">{selectedDistrict.hospitals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">PHCs / CHCs</span>
                    <span className="font-semibold">{selectedDistrict.phcs} / {selectedDistrict.chcs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Doctors</span>
                    <span className="font-semibold">{selectedDistrict.doctorsPresent} / {selectedDistrict.doctorsTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Beds Occupied</span>
                    <span className="font-semibold">{selectedDistrict.bedsOccupied} / {selectedDistrict.bedsTotal}</span>
                  </div>
                </div>

                {selectedDistrict.diseaseAlerts.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
                    <div className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1"><icons.AlertTriangle className="h-3 w-3" /> Active Alerts</div>
                    <ul className="list-disc pl-4 text-xs text-red-600">
                      {selectedDistrict.diseaseAlerts.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}

                <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                  <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><icons.Bot className="h-3 w-3" /> AI Recommendation</div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">{selectedDistrict.aiRecommendation}</div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <MousePointer2 className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click a district on the map to view detailed real-time statistics.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Resource Allocation', desc: 'Manage distributions', icon: icons.ArrowLeftRight, href: '/dashboard/state/allocation', color: 'text-amber-600' },
          { label: 'Disease Surveillance', desc: 'Outbreak heatmaps', icon: icons.Activity, href: '/dashboard/state/surveillance', color: 'text-red-600' },
          { label: 'AI Command Center', desc: 'Gemini Forecasts', icon: icons.Bot, href: '/dashboard/state/ai', color: 'text-blue-600' },
          { label: 'Analytics', desc: 'Statewide insights', icon: icons.BarChart2, href: '/dashboard/state/analytics', color: 'text-indigo-600' }
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition text-center">
            <item.icon className={cn('h-6 w-6', item.color)} />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
