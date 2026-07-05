'use client';

import React from 'react';
import { PageHeader } from '@/features/shared';
import { Bell, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorSettingsPage() {
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Clinical preferences saved successfully.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Preferences & Settings"
        description="Configure your audio transcriber inputs, EMR theme variants, and automated diagnostic push alerts."
      />

      <form onSubmit={handleSavePreferences} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Audio settings */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="h-4.5 w-4.5 text-blue-500" /> Transcription & AI Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>Auto-fill clinical notes from audio recordings</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>Enable Gemini prescribing alerts for drug-allergy interactions</span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-6">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-indigo-500" /> Queue Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" defaultChecked className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>Notify when critical patient checked in</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
              <span>Daily summary email of tomorrow&apos;s appointments queue</span>
            </label>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
