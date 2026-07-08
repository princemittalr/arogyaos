'use client';

import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { useLanguage } from '@/providers/LanguageProvider';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export default function RegisterPage() {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const ActivityIcon = icons.Activity;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16 transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="absolute inset-0 bg-glow-orb pointer-events-none z-0" />
      
      {/* Floating Animated Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-[280px] h-[280px] rounded-full bg-blue-500/10 blur-[90px] dark:bg-blue-500/5"
        />
        <motion.div 
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/5"
        />
      </div>

      {/* Top Left Header Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400 hover:opacity-90 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 dark:bg-blue-500/10">
            <ActivityIcon className="h-4.5 w-4.5" />
          </div>
          <span className="tracking-tight text-slate-950 dark:text-white font-extrabold">{t("common.arogyaos")}</span>
        </Link>
      </div>

      {/* Top Right Language Switcher */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <ThemeToggle />
        <select
          value={currentLanguage.code}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label={t("common.select_language", "Select Language")}
          className="rounded-lg border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-705 dark:text-slate-300 focus:outline-none cursor-pointer backdrop-blur-sm shadow-sm"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="ml">മലയാളം</option>
        </select>
      </div>

      <div className="relative z-10 w-full">
        <RegisterForm />
      </div>
    </div>
  );
}
