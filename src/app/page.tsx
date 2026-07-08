'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export default function Home() {
  const { t } = useLanguage();
  const ActivityIcon = icons.Activity;
  const BotIcon = icons.Bot;
  const ShieldIcon = icons.Shield;
  const UsersIcon = icons.Users;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="absolute inset-0 bg-glow-orb pointer-events-none z-0" />
      
      {/* Floating Animated Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/5"
        />
        <motion.div 
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5"
        />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/40 bg-white/60 px-6 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/60 md:px-12">
        <div className="flex items-center gap-2.5 font-bold text-lg text-blue-600 dark:text-blue-400">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-500/10">
            <ActivityIcon className="h-5 w-5" />
          </div>
          <span className="tracking-tight font-extrabold text-slate-900 dark:text-white">{t("common.arogyaos")}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            {t("auth.sign_in")}
          </Link>
          <Link
            href="/dashboard"
            className={`${componentStyles.button.base} ${componentStyles.button.primary} px-5 py-2 text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95`}
          >
            {t("common.access_dashboard")}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center py-16 px-6 md:py-24 md:px-12 max-w-6xl mx-auto w-full">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          
          {/* Hero text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 lg:col-span-7"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-blue-200/40 bg-blue-50/50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
              <BotIcon className="h-4 w-4 animate-pulse text-blue-500" />
              <span className="tracking-wider uppercase font-bold text-[10px]">{t("common.google_hackathon_edition")}</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1]">
              {t("common.ai_powered_unified_healthcare")}{" "}
              <span className="gradient-text-animated block sm:inline">{t("common.operating_system")}</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              {t("common.connecting_citizen_health_portals_clinics_pharmacies_laboratories_and_district_managers_into_a_single_synchronized_predictive_intelligence_network")}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className={`${componentStyles.button.base} ${componentStyles.button.primary} group gap-2 px-8 py-4 text-base shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-95`}
              >
                <span>{t("common.launch_platform")}</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#features"
                className={`${componentStyles.button.base} ${componentStyles.button.secondary} px-8 py-4 text-base hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95`}
              >
                {t("common.learn_more")}
              </a>
            </motion.div>

            {/* Quick Metrics display */}
            <motion.div 
              variants={itemVariants} 
              className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50"
            >
              <div>
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">10k+</div>
                <div className="text-xs text-slate-400 dark:text-slate-550 mt-1 uppercase tracking-wider font-bold">Citizens Active</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">98.7%</div>
                <div className="text-xs text-slate-400 dark:text-slate-550 mt-1 uppercase tracking-wider font-bold">AI Accuracy</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">99.9%</div>
                <div className="text-xs text-slate-400 dark:text-slate-550 mt-1 uppercase tracking-wider font-bold">System SLA</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual Mockup Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
            className="lg:col-span-5 relative"
            id="features"
          >
            {/* Console Wrapper Frame */}
            <div className="relative rounded-2xl border border-slate-200/60 bg-white/40 p-1.5 shadow-2xl dark:border-slate-800/50 dark:bg-slate-900/20 backdrop-blur-xl">
              
              {/* Console header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/20 dark:border-slate-805/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 dark:bg-red-500/40" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 dark:bg-amber-500/40" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/40" />
                </div>
                <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">arogya_telemetry_node</div>
                <div className="w-12" />
              </div>

              {/* Grid content */}
              <div className="grid gap-4 sm:grid-cols-2 p-4">
                
                {/* Card 1: Gemini AI */}
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-xl border border-blue-100 bg-white/70 p-5 shadow-sm dark:border-blue-900/20 dark:bg-slate-900/70 transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/40"
                >
                  <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <BotIcon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{t("common.gemini_ai_engine")}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {t("common.medicine_shortage_predictions_patient_inflow_forecasting_and_instant_voice_to_text_clinical_summaries")}
                  </p>
                </motion.div>

                {/* Card 2: Real-time Telemetry */}
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-xl border border-emerald-100 bg-white/70 p-5 shadow-sm dark:border-emerald-900/20 dark:bg-slate-900/70 transition-all duration-300 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/40"
                >
                  <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <ActivityIcon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{t("common.real_time_telemetry")}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {t("common.immediate_bed_capacity_tracking_inventory_thresholds_and_department_occupancy_statistics")}
                  </p>
                </motion.div>

                {/* Card 3: Role-based Workspaces */}
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-xl border border-indigo-100 bg-white/70 p-5 shadow-sm dark:border-indigo-900/20 dark:bg-slate-900/70 transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/40"
                >
                  <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <UsersIcon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{t("common.role_based_workspaces")}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {t("common.dedicated_interfaces_for_citizens_doctors_nurses_pharmacists_and_district_administrators")}
                  </p>
                </motion.div>

                {/* Card 4: Secure Foundations */}
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <ShieldIcon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{t("common.secure_foundations")}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {t("common.role_claims_verification_hipaa_ready_firestore_boundaries_and_unified_oauth_session_cookies")}
                  </p>
                </motion.div>

              </div>
            </div>
            
            {/* Visual background details */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-[-1]" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-[-1]" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}