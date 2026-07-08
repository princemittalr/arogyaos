'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { icons } from '@/design-system/icons';
import { useLanguage } from '@/providers/LanguageProvider';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={t('common.toggle_theme', 'Toggle Theme')}
      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
    >
      {!mounted ? (
        <div className="h-4.5 w-4.5" />
      ) : resolvedTheme === 'dark' ? (
        <icons.Sun className="h-4.5 w-4.5 text-amber-400" aria-hidden="true" />
      ) : (
        <icons.Moon className="h-4.5 w-4.5 text-slate-500" aria-hidden="true" />
      )}
    </button>
  );
}
