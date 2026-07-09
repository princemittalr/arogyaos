'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  useDistrictRecommendations,
  useResolveRecommendationMutation,
  useDistrictAlerts } from
'@/features/district/hooks/useDistrict';
import { LoadingState } from '@/features/shared';
import {
  Activity, AlertTriangle, Building, Building2, Heart, Users, MapPin, Sparkles,
  Info, ArrowLeftRight, Pill, Bed, UserCheck, CheckCircle2 } from
'lucide-react';
import { toast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDistrictMap } from '@/features/district/hooks/useDistrictMap';
import { DistrictFacilityNode } from '@/features/district/services/DistrictMapData';

const InteractiveFacilityMap = dynamic(() => import('@/features/district/components/InteractiveFacilityMap'), { ssr: false, loading: () => <div className="w-full h-[350px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" /> });



const MetricCard = ({
  label, value, icon: Icon, color = 'blue'



}: {label: string;value: string | number;icon: React.ElementType;color?: string;}) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 transition-all duration-200">
      <div className={cn('inline-flex rounded-lg p-2 mb-4', colors[color] || colors.blue)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
    </div>);

};

export default function DistrictDashboardPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: facilities, isLoading: facLoading } = useDistrictMap(districtId);
  const { data: recommendations, isLoading: recLoading } = useDistrictRecommendations(districtId);
  const { data: alerts, isLoading: alertsLoading } = useDistrictAlerts(districtId);
  const resolveRecMutation = useResolveRecommendationMutation();

  const [selectedFacility, setSelectedFacility] = useState<DistrictFacilityNode | null>(null);

  if (facLoading || recLoading || alertsLoading) return <LoadingState variant="card" />;

  const listFac = facilities || [];
  const listRecs = recommendations || [];
  const listAlerts = alerts || [];

  const totalHospitals = listFac.filter((f) => f.type === 'hospital').length;
  const totalPHCs = listFac.filter((f) => f.type === 'phc').length;
  const totalCHCs = listFac.filter((f) => f.type === 'chc').length;
  const totalDoctors = listFac.reduce((acc, f) => acc + f.doctorsPresent, 0);
  const totalPatients = listFac.reduce((acc, f) => acc + f.bedsOccupied, 0);
  const avgHealthScore = listFac.length ? Math.round(listFac.reduce((acc, f) => acc + (f.status === 'green' ? 95 : f.status === 'yellow' ? 70 : 40), 0) / listFac.length) : 0;

  const handleReviewRec = async (recId: string) => {
    try {
      await resolveRecMutation.mutateAsync({ recId, districtId });
    } catch {
      toast.error(t("district.failed_to_update_recommendation"));
    }
  };

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
      
      {/* 1. Welcome Header (Executive Summary) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t("district.district_command_center")}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr}{t("district.executive_overview")}</p>
        </div>
        <Link href="/dashboard/district/reports" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/20">
          <Activity className="h-4 w-4" />{t("district.download_full_report")}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label={t("district.hospitals")} value={totalHospitals} icon={Building2} color="blue" />
        <MetricCard label={t("district.phcs")} value={totalPHCs} icon={Building} color="indigo" />
        <MetricCard label={t("district.chcs")} value={totalCHCs} icon={Building} color="purple" />
        <MetricCard label={t("district.doctors_active")} value={totalDoctors} icon={Users} color="emerald" />
        <MetricCard label={t("district.total_admitted")} value={totalPatients} icon={Activity} color="amber" />
        <MetricCard label={t("district.health_score")} value={`${avgHealthScore}%`} icon={Heart} color={avgHealthScore > 80 ? 'emerald' : 'amber'} />
      </div>

      {/* 2. Critical Alerts */}
      {listAlerts.length > 0 &&
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-red-900 dark:text-red-100">{t("district.critical_district_alerts")}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listAlerts.map((alert) =>
          <div key={alert.alertId} className="rounded-lg bg-white/70 dark:bg-slate-900/50 p-3.5 border border-red-100 dark:border-red-900/30">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{alert.hospitalName}</p>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', alert.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400')}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{alert.message}</p>
              </div>
          )}
          </div>
        </div>
      }

      {/* 3. District Map & 4. Hospital Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* District Map */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-500" />{t("district.interactive_facility_map")}
            </h2>
          </div>
          <div className="relative rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-850 dark:bg-slate-950 h-[350px] overflow-hidden">
            <InteractiveFacilityMap facilities={listFac} onFacilityClick={setSelectedFacility} selectedFacility={selectedFacility} />
          </div>
        </div>

        {/* Hospital Status Details */}
        <div className="space-y-6">
          {selectedFacility ?
          <div className="rounded-xl border-2 border-blue-500 bg-white p-5 dark:bg-slate-900 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{selectedFacility.type}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50 mt-1">{selectedFacility.name}</h3>
                </div>
                <button onClick={() => setSelectedFacility(null)} className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition">{t("district.close")}</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-500">Bed Occupancy</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedFacility.bedsOccupied}/{selectedFacility.bedsTotal}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-500">Doctors</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedFacility.doctorsPresent}/{selectedFacility.doctorsTotal}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-500">Nurses</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedFacility.nursesPresent}/{selectedFacility.nursesTotal}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-500">Critical Patients</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedFacility.criticalPatients}</p>
                </div>
              </div>
              <div className="space-y-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Medicine Stock:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedFacility.medicineStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending Ambulances:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedFacility.pendingAmbulances}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedFacility.lastUpdated}</span>
                </div>
                
                {selectedFacility.openAlerts.length > 0 && (
                  <div className="mt-2 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-100 dark:border-red-900/50">
                    <p className="font-semibold text-red-600 mb-1">Active Alerts</p>
                    <ul className="list-disc list-inside text-red-500">
                      {selectedFacility.openAlerts.map((alert, i) => <li key={i}>{alert}</li>)}
                    </ul>
                  </div>
                )}
                
                <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-100 dark:border-blue-900/50">
                  <p className="font-semibold text-blue-600 mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Recommendation</p>
                  <p className="text-blue-700 dark:text-blue-400">{selectedFacility.aiRecommendation}</p>
                </div>
              </div>
            </div> :

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 h-full flex flex-col items-center justify-center text-center">
              <MapPin className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("district.select_a_facility")}</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">{t("district.click_a_pin_on_the_map_to_view_detailed_real_time_statistics")}</p>
            </div>
          }
        </div>
      </div>

      {/* 5, 6, 7, 8. Quick Navigation (Medicine, Beds, Doctors, Redistribution) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
        { label: t("district.medicine_monitor"), desc: 'Track low stock & expiry', icon: Pill, href: '/dashboard/district/medicine-monitoring', color: 'text-indigo-600' },
        { label: t("district.bed_occupancy"), desc: 'Manage ward capacities', icon: Bed, href: '/dashboard/district/bed-monitoring', color: 'text-blue-600' },
        { label: t("district.doctor_attendance"), desc: 'View staff availability', icon: UserCheck, href: '/dashboard/district/doctor-attendance', color: 'text-emerald-600' },
        { label: t("district.redistribution"), desc: 'Shift resources', icon: ArrowLeftRight, href: '/dashboard/district/redistribution', color: 'text-amber-600' }].
        map((item) =>
        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition text-center">
            <item.icon className={cn('h-6 w-6', item.color)} />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        )}
      </div>

      {/* 9. AI Recommendations */}
      <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t("district.ai_recommendations_forecasting")}</h2>
          </div>
          <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">{t("district.gemini_active")}</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {listRecs.filter((r) => r.status === 'pending').map((rec) =>
          <div key={rec.recId} className="rounded-xl bg-white/80 dark:bg-slate-900/60 p-4 border border-white/50 dark:border-slate-800/50 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded', rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                    {rec.priority}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">{rec.confidence}{t("district.confidence")}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">{rec.title}</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{rec.description}</p>
                <div className="flex items-start gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold mb-4 bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded-lg">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {rec.suggestedAction}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[9px] text-slate-400 font-medium">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                <button
                onClick={() => handleReviewRec(rec.recId)}
                disabled={resolveRecMutation.isPending}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-[10px] font-semibold transition">{t("district.mark_reviewed")}


              </button>
              </div>
            </div>
          )}
          {listRecs.filter((r) => r.status === 'pending').length === 0 &&
          <div className="col-span-2 py-8 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t("district.all_recommendations_reviewed")}</p>
            </div>
          }
        </div>
      </div>

    </motion.div>);

}