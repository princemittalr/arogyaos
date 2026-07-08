'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { PageHeader } from '@/features/shared';
import { Bell, Volume2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';


export default function DoctorSettingsPage() {const { t } = useLanguage();
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t("doctor.clinical_preferences_saved_successfully"));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("doctor.clinical_preferences_settings")}
        description={t("doctor.configure_your_audio_transcriber_inputs_emr_theme_variants_and_automated_diagnostic_push_alerts")} />
      

      <form onSubmit={handleSavePreferences} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Audio settings */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="h-4.5 w-4.5 text-blue-500" />{t("doctor.transcription_ai_settings")}
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>{t("doctor.auto_fill_clinical_notes_from_audio_recordings")}</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>{t("doctor.enable_gemini_prescribing_alerts_for_drug_allergy_interactions")}</span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-indigo-500" />{t("doctor.queue_notifications")}
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>{t("doctor.notify_when_critical_patient_checked_in")}</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Input type="checkbox" className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>{t("doctor.daily_summary_email_of_tomorrows_appointments_queue")}</span>
            </label>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition">{t("doctor.save_settings")}


          </button>
        </div>
      </form>
    </div>);

}