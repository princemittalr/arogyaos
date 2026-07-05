'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export default function Home() {
  const ActivityIcon = icons.Activity;
  const BotIcon = icons.Bot;
  const ShieldIcon = icons.Shield;
  const UsersIcon = icons.Users;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 px-6 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/70 md:px-12">
        <div className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400">
          <ActivityIcon className="h-6 w-6" />
          <span>ArogyaOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={`${componentStyles.button.base} ${componentStyles.button.primary} px-5 py-2`}
          >
            Access Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-20 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <BotIcon className="h-4 w-4" />
              <span>Google Hackathon Edition</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              AI-Powered Unified Healthcare <span className="text-blue-600 dark:text-blue-400">Operating System</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Connecting citizen health portals, clinics, pharmacies, laboratories, and district managers into a single synchronized predictive intelligence network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className={`${componentStyles.button.base} ${componentStyles.button.primary} px-8 py-3.5 text-base shadow-lg shadow-blue-500/20`}
              >
                Launch Platform
              </Link>
              <a
                href="#features"
                className={`${componentStyles.button.base} ${componentStyles.button.secondary} px-8 py-3.5 text-base`}
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Hero Visual Mockup Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className={`${componentStyles.card.base} p-6 border-blue-100 dark:border-blue-900/20`}>
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <BotIcon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base mb-1">Gemini AI Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Medicine shortage predictions, patient inflow forecasting, and instant voice-to-text clinical summaries.
              </p>
            </div>

            <div className={`${componentStyles.card.base} p-6 border-emerald-100 dark:border-emerald-900/20`}>
              <div className="mb-4 text-emerald-600 dark:text-emerald-400">
                <ActivityIcon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base mb-1">Real-time Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Immediate bed capacity tracking, inventory thresholds, and department occupancy statistics.
              </p>
            </div>

            <div className={`${componentStyles.card.base} p-6 border-indigo-100 dark:border-indigo-900/20`}>
              <div className="mb-4 text-indigo-600 dark:text-indigo-400">
                <UsersIcon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base mb-1">Role-Based Workspaces</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Dedicated interfaces for Citizens, Doctors, Nurses, Pharmacists, and District Administrators.
              </p>
            </div>

            <div className={`${componentStyles.card.base} p-6 border-slate-100 dark:border-slate-800`}>
              <div className="mb-4 text-slate-600 dark:text-slate-400">
                <ShieldIcon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base mb-1">Secure Foundations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Role claims verification, HIPAA-ready Firestore boundaries, and unified OAuth session cookies.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

