'use client';

import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { PageHeader } from '@/features/shared';
import { useTheme } from 'next-themes';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CitizenSettingsPage() {
  const { currentLanguage, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { logout, isLoggingOut } = useAuthActions();

  const handleSavePreferences = () => {
    toast.success('Configuration preferences saved successfully.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <PageHeader
        title="Workspace Configuration"
        description="Update visual theme parameters, local interface translations, and alert notification triggers."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-50">Local Interface Language</span>
            <p className="text-xs text-slate-500">Pick standard translation templates for dashboard widgets.</p>
          </div>

          <select
            value={currentLanguage.code}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none"
          >
            <option value="en">English (US)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
          </select>
        </div>

        {/* Theme Settings */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-50">Display Contrast Mode</span>
            <p className="text-xs text-slate-500">Toggle dark color schemas to alleviate optical fatigue.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'rounded-xl border px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5',
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/10 text-blue-600'
                  : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600'
              )}
            >
              <icons.Sun className="h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'rounded-xl border px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5',
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/10 text-blue-600'
                  : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600'
              )}
            >
              <icons.Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Mock Notification preferences */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-50">Push Alerts Sync</span>
            <p className="text-xs text-slate-500">Receive alerts regarding lab report completions.</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Mock Privacy Settings */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-850 pb-4 gap-3">
          <div className="space-y-1">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-50">Anonymize Profile Health Data</span>
            <p className="text-xs text-slate-500">Encrypt demographic details in district research surveys.</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Save button and Logout CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full sm:w-auto rounded-xl border border-red-200 text-red-650 bg-white hover:bg-red-50 dark:border-red-950/20 dark:bg-slate-900 dark:hover:bg-red-950/20 px-6 py-2.5 text-xs font-bold transition text-center"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out Session'}
          </button>

          <button
            onClick={handleSavePreferences}
            className={cn(
              componentStyles.button.base,
              componentStyles.button.primary,
              'w-full sm:w-auto px-6 py-2.5 text-xs'
            )}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </motion.div>
  );
}
