'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { PageHeader } from '@/features/shared';
import { useDoctorSummaryMutation } from '@/features/ai/hooks/useAI';
import type { DoctorSummaryResult } from '@/features/ai/services/doctorSummary.service';
import {
  Sparkles,
  Mic,
  ClipboardList,
  Loader2,
  Pill,
  Stethoscope,
  MessageSquare,
  RotateCcw,
  Copy } from
'lucide-react';
import { toast } from 'sonner';

const SAMPLE_NOTES = `Patient: Male, 34 years. C/O fever since 3 days, dry cough, mild sore throat. No breathlessness. O/E: Temp 101.2F, BP 110/70, SpO2 98%. Throat hyperemic. Chest clear.`;

export default function DoctorAISummaryPage() {const { t } = useLanguage();
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [result, setResult] = useState<DoctorSummaryResult | null>(null);

  const summaryMutation = useDoctorSummaryMutation();

  const handleGenerate = async () => {
    if (!clinicalNotes.trim()) {
      toast.error(t("doctor.please_enter_clinical_notes_first"));
      return;
    }
    try {
      const data = await summaryMutation.mutateAsync({ clinicalNotes });
      setResult(data);
    } catch {
      toast.error(t("doctor.failed_to_generate_ai_summary_please_try_again"));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("doctor.copied_to_clipboard"));
  };

  const handleReset = () => {
    setClinicalNotes('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("doctor.ai_clinical_consultation_summary")}
        description={t("doctor.enter_your_clinical_notes_and_let_gemini_ai_generate_a_structured_diagnosis_and_prescription_draft")} />
      

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input Panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-blue-500" />{t("doctor.clinical_notes_input")}
              </h3>
              <button
                onClick={() => setClinicalNotes(SAMPLE_NOTES)}
                className="text-[9px] font-bold text-blue-500 hover:text-blue-650 transition">{t("doctor.load_sample")}


              </button>
            </div>

            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder={t("doctor.enter_clinical_notes_symptoms_vitals_observations")}
              rows={10}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-100 font-semibold leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            

            {/* Voice Transcript Placeholder */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Mic className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{t("doctor.voice_transcript")}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{t("doctor.voice_to_text_integration_coming_in_phase_5")}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              {result &&
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-1.5 transition">
                
                  <RotateCcw className="h-3.5 w-3.5" />{t("doctor.reset")}
              </button>
              }
              <button
                onClick={handleGenerate}
                disabled={summaryMutation.isPending || !clinicalNotes.trim()}
                className="rounded-xl bg-blue-600 hover:bg-blue-750 disabled:opacity-50 text-white px-5 py-2.5 text-[11px] font-extrabold flex items-center gap-2 transition">
                
                {summaryMutation.isPending ?
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />{t("doctor.generating")}
                </> :

                <>
                    <Sparkles className="h-4 w-4" />{t("doctor.generate_ai_summary")}
                </>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output Panel */}
        <div className="space-y-4">
          {summaryMutation.isPending &&
          <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-450 font-semibold">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />{t("doctor.gemini_ai_is_generating_your_clinical_summary")}

            </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) =>
              <div key={i} className={`h-3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse ${i === 3 ? 'w-3/4' : 'w-full'}`} />
              )}
              </div>
            </div>
          }

          {!summaryMutation.isPending && !result &&
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center text-center gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <Stethoscope className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{t("doctor.ai_summary_will_appear_here")}</p>
              <p className="text-[10px] text-slate-400 font-semibold max-w-xs">{t("doctor.enter_clinical_notes_and_click_generate_to_get_a_structured_diagnosis_and_prescription_draft")}</p>
            </div>
          }

          {result &&
          <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-blue-500" />{t("doctor.clinical_summary")}
                </h4>
                  <button onClick={() => handleCopy(result.summary)} className="text-slate-400 hover:text-slate-650 transition">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{result.summary}</p>
              </div>

              {/* Diagnosis */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-emerald-500" />{t("doctor.diagnosis")}
              </h4>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{result.diagnosis}</p>

                {result.symptomsList?.length > 0 &&
              <div className="flex flex-wrap gap-2 pt-1">
                    {result.symptomsList.map((sym, i) =>
                <span key={i} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                        {sym}
                      </span>
                )}
                  </div>
              }
              </div>

              {/* Prescription Draft */}
              {result.prescriptionDraft?.length > 0 &&
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-purple-500" />{t("doctor.prescription_draft")}
                </h4>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">{t("doctor.requires_doctor_review")}

                </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                    {result.prescriptionDraft.map((rx, i) =>
                <div key={i} className="py-3 flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                        <div>
                          <p className="text-slate-900 dark:text-slate-50">{rx.medicineName}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{rx.dosage}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded">
                          {rx.duration}
                        </span>
                      </div>
                )}
                  </div>
                </div>
            }

              {/* Follow Up */}
              {result.followUpAdvice &&
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("doctor.follow_up_advice")}

              </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{result.followUpAdvice}</p>
                </div>
            }
            </div>
          }
        </div>
      </div>
    </div>);

}