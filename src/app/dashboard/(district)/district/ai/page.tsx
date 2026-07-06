'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { AIChatPanel } from '@/features/ai/components';
import { useDistrictFacilities, useDistrictAlerts } from '@/features/district/hooks/useDistrict';
import { useDistrictAISummary } from '@/features/ai/hooks/useAI';
import { useAuth } from '@/providers/AuthProvider';
import {
  Sparkles,
  BrainCircuit,
  Activity,
  MessageCircle,
  AlertTriangle,
  Building,
  TrendingUp,
  ShieldCheck,
  Loader2,
  BarChart3 } from
'lucide-react';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>);

}

export default function AIIntelligencePage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: facilities } = useDistrictFacilities(districtId);
  const { data: alerts } = useDistrictAlerts(districtId);

  const facilityList = facilities || [];
  const alertList = alerts || [];

  const summaryInput = {
    hospitalsCount: facilityList.filter((f) => f.type === 'hospital').length,
    phcsCount: facilityList.filter((f) => f.type === 'phc').length,
    chcsCount: facilityList.filter((f) => f.type === 'chc').length,
    totalDoctors: facilityList.reduce((acc, f) => acc + f.doctorsPresent, 0),
    activeAlerts: alertList.map((a) => ({
      hospitalName: a.hospitalName,
      message: a.message,
      severity: a.severity
    }))
  };

  const { data: districtSummary, isLoading: summaryLoading } = useDistrictAISummary(
    summaryInput,
    facilityList.length > 0
  );

  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'capabilities'>('summary');

  const tabs = [
  { id: 'summary' as const, label: t("district.district_ai_brief"), icon: BarChart3 },
  { id: 'chat' as const, label: t("district.operations_assistant"), icon: MessageCircle },
  { id: 'capabilities' as const, label: t("district.ai_capabilities"), icon: BrainCircuit }];


  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />
        <div className="absolute top-4 right-6 opacity-10">
          <BrainCircuit className="h-32 w-32" />
        </div>

        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">{t("district.gemini_ai_intelligence_engine")}

            </span>
          </div>
          <h1 className="text-2xl font-black leading-tight">{t("district.arogyaos_ai_command")}

            <br />
            <span className="text-blue-400">{t("district.intelligence_layer")}</span>
          </h1>
          <p className="text-sm text-slate-400 font-semibold max-w-xl">{t("district.powered_by_google_gemini_real_time_forecasting_resource_redistribution_clinical_summaries_and_natural_language_district_operations_assistant")}

          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {[
            { icon: Activity, label: t("district.7_ai_features_active") },
            { icon: ShieldCheck, label: t("district.server_side_api_security") },
            { icon: TrendingUp, label: t("district.live_context_inference") },
            { icon: Building, label: t("district.district_wide_coverage") }].
            map(({ icon: Icon, label }) =>
            <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-300">
                <Icon className="h-3.5 w-3.5 text-blue-400" />
                {label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) =>
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
          activeTab === id ?
          'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm' :
          'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`
          }>
          
            <Icon className="h-4 w-4" />
            {label}
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' &&
      <div className="grid gap-6 lg:grid-cols-3">
          {/* District AI Summary Panel */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-500" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.gemini_district_operational_brief")}

            </h3>
            </div>

            {summaryLoading ?
          <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 text-xs text-slate-450 font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />{t("district.analysing_district_parameters_with_gemini_ai")}

            </div>
                <TypingDots />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) =>
              <div key={i} className={`h-3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse ${i === 2 ? 'w-2/3' : 'w-full'}`} />
              )}
                </div>
              </div> :
          districtSummary ?
          <div className="space-y-5">
                {/* Operational summary */}
                <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20">
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {districtSummary.operationalSummary}
                  </p>
                </div>

                {/* Critical Issues */}
                {districtSummary.criticalIssues?.length > 0 &&
            <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />{t("district.critical_issues")}
              </h4>
                    <div className="space-y-1.5">
                      {districtSummary.criticalIssues.map((issue: string, idx: number) =>
                <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-red-50/30 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{issue}</p>
                        </div>
                )}
                    </div>
                  </div>
            }

                {/* AI Recommendations */}
                {districtSummary.recommendations?.length > 0 &&
            <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />{t("district.ai_recommendations")}
              </h4>
                    <div className="space-y-1.5">
                      {districtSummary.recommendations.map((rec: string, idx: number) =>
                <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">{rec}</p>
                        </div>
                )}
                    </div>
                  </div>
            }
              </div> :

          <p className="text-xs text-slate-450 italic py-4">{t("district.seed_district_data_to_generate_ai_insights")}</p>
          }
          </div>

          {/* Priority Ranking */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.ai_priority_ranking")}

            </h3>
            </div>

            {summaryLoading ?
          <div className="space-y-3">
                {[...Array(3)].map((_, i) =>
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            )}
              </div> :
          districtSummary?.facilityPriorityRanking?.length > 0 ?
          <div className="space-y-3">
                {districtSummary.facilityPriorityRanking.map(
              (fac: {facilityName: string;priorityScore: number;attentionReason: string;}, idx: number) =>
              <div key={idx} className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1.5 hover:border-slate-300 dark:hover:border-slate-750 transition">
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] font-extrabold text-slate-900 dark:text-slate-50">{fac.facilityName}</p>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                  fac.priorityScore > 80 ? 'bg-red-50 text-red-650' : 'bg-amber-50 text-amber-650'}`
                  }>{t("district.score")}
                    {fac.priorityScore}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">{fac.attentionReason}</p>
                    </div>

            )}
              </div> :

          <p className="text-xs text-slate-450 italic py-4">{t("district.no_priority_data_available_yet")}</p>
          }
          </div>
        </div>
      }

      {activeTab === 'chat' &&
      <div className="max-w-3xl">
          <AIChatPanel />
          <div className="mt-4 flex flex-wrap gap-2">
            {[
          'Which hospitals are running low on insulin?',
          'Show facilities with bed occupancy above 90%.',
          'Which PHC has the highest patient load?',
          'Summarize today\'s district operations.'].
          map((suggestion) =>
          <button
            key={suggestion}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/40 transition">
            
                {suggestion}
              </button>
          )}
          </div>
        </div>
      }

      {activeTab === 'capabilities' &&
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
        {
          icon: Activity,
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-950/20',
          title: t("district.medicine_stock_forecast"),
          description: t("district.predicts_shortage_dates_using_consumption_velocity_seasonal_trends_and_threshold_parameters"),
          endpoint: '/api/ai/stock-forecast'
        },
        {
          icon: TrendingUp,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          title: t("district.patient_footfall_forecast"),
          description: t("district.generates_tomorrow_and_weekly_opdipd_load_predictions_and_expected_wait_time_estimates"),
          endpoint: '/api/ai/patient-forecast'
        },
        {
          icon: ShieldCheck,
          color: 'text-indigo-500',
          bg: 'bg-indigo-50 dark:bg-indigo-950/20',
          title: t("district.hospital_health_score"),
          description: t("district.computes_0100_health_score_from_bed_occupancy_medicine_availability_attendance_and_alerts"),
          endpoint: '/api/ai/health-score'
        },
        {
          icon: Building,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          title: t("district.resource_redistribution"),
          description: t("district.recommends_supply_transfers_between_facilities_to_prevent_critical_stock_out_conditions"),
          endpoint: '/api/ai/resource-redistribution'
        },
        {
          icon: Sparkles,
          color: 'text-purple-500',
          bg: 'bg-purple-50 dark:bg-purple-950/20',
          title: t("district.doctor_consultation_summary"),
          description: t("district.converts_raw_clinical_notes_into_structured_diagnosis_reports_with_prescription_drafts"),
          endpoint: '/api/ai/doctor-summary'
        },
        {
          icon: MessageCircle,
          color: 'text-rose-500',
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          title: t("district.natural_language_chat"),
          description: t("district.query_operational_status_using_plain_english_context_aware_with_live_facility_data"),
          endpoint: '/api/ai/chat'
        }].
        map((cap) =>
        <div key={cap.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3 hover:border-slate-300 dark:hover:border-slate-750 transition group">
              <div className={`h-10 w-10 rounded-xl ${cap.bg} flex items-center justify-center`}>
                <cap.icon className={`h-5 w-5 ${cap.color}`} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50">{cap.title}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{cap.description}</p>
              </div>
              <div className="pt-1">
                <code className="text-[9px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">{t("district.post")}
              {cap.endpoint}
                </code>
              </div>
            </div>
        )}
        </div>
      }
    </div>);

}