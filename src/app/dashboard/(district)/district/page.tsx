'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useDistrictFacilities,
  useDistrictRecommendations,
  useResolveRecommendationMutation,
  useDistrictAlerts,
} from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import {
  Activity,
  AlertTriangle,
  Building,
  Heart,
  Users,
  MapPin,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { DistrictFacility } from '@/features/district/services/district.service';

export default function DistrictDashboardPage() {
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: facilities, isLoading: facLoading } = useDistrictFacilities(districtId);
  const { data: recommendations, isLoading: recLoading } = useDistrictRecommendations(districtId);
  const { data: alerts, isLoading: alertsLoading } = useDistrictAlerts(districtId);

  const resolveRecMutation = useResolveRecommendationMutation();

  const [selectedFacility, setSelectedFacility] = useState<DistrictFacility | null>(null);

  if (facLoading || recLoading || alertsLoading) {
    return <LoadingState variant="card" />;
  }

  const listFac = facilities || [];
  const listRecs = recommendations || [];
  const listAlerts = alerts || [];

  // Metrics calculations
  const totalHospitals = listFac.filter((f) => f.type === 'hospital').length;
  const totalPHCs = listFac.filter((f) => f.type === 'phc').length;
  const totalCHCs = listFac.filter((f) => f.type === 'chc').length;
  const totalDoctors = listFac.reduce((acc, f) => acc + f.doctorsPresent, 0);
  const totalPatients = listFac.reduce((acc, f) => acc + f.patientsCount, 0);
  const avgHealthScore = listFac.length
    ? Math.round(listFac.reduce((acc, f) => acc + f.healthScore, 0) / listFac.length)
    : 0;

  const handleReviewRecommendation = async (recId: string) => {
    try {
      await resolveRecMutation.mutateAsync({ recId, districtId });
    } catch {
      toast.error('Failed to update recommendation status.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District AI Command Center"
        description="Unified health dashboard for real-time facility resource tracking, AI predictions, and logistic redistribution."
      />

      {/* Executive Overview Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">Hospitals</span>
            <Building className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{totalHospitals}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">PHCs</span>
            <Building className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{totalPHCs}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">CHCs</span>
            <Building className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{totalCHCs}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">Doctors</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{totalDoctors}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">Admitted</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{totalPatients}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">Alerts</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{listAlerts.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-450 uppercase">Health</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-slate-900 dark:text-slate-50">{avgHealthScore}%</p>
        </div>
      </div>

      {/* Main Command Dashboard Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left 2 Columns: Map & Drawer + AI recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Interactive Map Visualizer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <MapPin className="h-4.5 w-4.5 text-blue-500" /> Interactive Facility GIS Map
              </h3>
              <p className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded">
                Click pin markers to query live resources
              </p>
            </div>

            {/* Map Placeholder Graphic & Points of Interest */}
            <div className="relative rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-850 dark:bg-slate-950/40 h-80 overflow-hidden flex items-center justify-center">
              
              {/* Simulated Map Topography */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              {/* GIS Markers */}
              <div className="relative w-full h-full">
                {listFac.map((fac) => {
                  // Map coordinates to percentage positions for UI display
                  const topPercent = fac.type === 'hospital' ? '30%' : fac.type === 'phc' ? '65%' : '48%';
                  const leftPercent = fac.type === 'hospital' ? '40%' : fac.type === 'phc' ? '25%' : '75%';
                  const colorClass = fac.status === 'green' ? 'bg-emerald-500' : fac.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500';

                  return (
                    <button
                      key={fac.facilityId}
                      style={{ top: topPercent, left: leftPercent }}
                      onClick={() => setSelectedFacility(fac)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
                    >
                      <div className={`h-4.5 w-4.5 rounded-full ${colorClass} border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg shadow-black/20 hover:scale-125 transition duration-200`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      </div>
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {fac.name} ({fac.healthScore}%)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-450 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> Operational / Healthy
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" /> Capacity Warnings
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" /> Critical Intervention Needed
                </div>
              </div>
            </div>
          </div>

          {/* AI Command Recommendations Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-blue-500" /> AI Logistical & Medical Forecasting
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {listRecs.filter(r => r.status === 'pending').map((rec) => {
                const isHigh = rec.priority === 'high';
                return (
                  <div
                    key={rec.recId}
                    className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-950/20 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-750 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isHigh ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400' : 'bg-amber-50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Confidence: {rec.confidence}%
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{rec.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{rec.description}</p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-150 dark:border-slate-850">
                      <div className="text-[10px] text-blue-650 dark:text-blue-400 font-bold flex items-start gap-1">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>Suggested Action: {rec.suggestedAction}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-slate-400 font-semibold">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                        <button
                          onClick={() => handleReviewRecommendation(rec.recId)}
                          disabled={resolveRecMutation.isPending}
                          className="rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 px-3.5 py-1.5 text-[9px] font-bold transition"
                        >
                          Mark Reviewed
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Facility Drawer / Facility Stats */}
        <div className="space-y-6">
          {selectedFacility ? (
            <div className="rounded-2xl border-2 border-blue-500 bg-white p-5 dark:bg-slate-900 space-y-5 shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-3">
                <div>
                  <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {selectedFacility.type}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mt-1.5">{selectedFacility.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="text-slate-400 hover:text-slate-650 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                  <p className="text-[10px] text-slate-400 font-semibold">Health Score</p>
                  <p className="text-lg font-black mt-1 text-slate-900 dark:text-slate-50">{selectedFacility.healthScore}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                  <p className="text-[10px] text-slate-400 font-semibold">Status Indicator</p>
                  <span className={`inline-block mt-2 h-2.5 w-2.5 rounded-full ${
                    selectedFacility.status === 'green' ? 'bg-emerald-500' : selectedFacility.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Live Capacity Audit</h5>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-650 dark:text-slate-350 mb-1">
                      <span>Beds Available: {selectedFacility.bedsAvailable}</span>
                      <span>Total: {selectedFacility.bedsTotal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(selectedFacility.bedsAvailable / selectedFacility.bedsTotal) * 100}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-650 dark:text-slate-350 mb-1">
                      <span>Doctors Present: {selectedFacility.doctorsPresent}</span>
                      <span>Total: {selectedFacility.doctorsTotal}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${(selectedFacility.doctorsPresent / selectedFacility.doctorsTotal) * 100}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Live Facility Node Inspector</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Interact with the GIS health map or click a location pin to pull real-time parameters.
              </p>
            </div>
          )}

          {/* Live Alerts Stream */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500 animate-pulse" /> Live Critical Alerts
            </h3>

            {listAlerts.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {listAlerts.map((alert) => (
                  <div key={alert.alertId} className="py-3.5 space-y-1.5 font-bold text-slate-805">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-900 dark:text-slate-50 text-[11px]">{alert.hospitalName}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold">{alert.type.replace('_', ' ')}</p>
                      </div>
                      <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                        alert.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-450 italic py-6 text-center">No active alerts triggered.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
