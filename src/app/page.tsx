'use client';

import { useLanguage } from "@/providers/LanguageProvider";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export default function Home() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ActivityIcon = icons.Activity;
  const BotIcon = icons.Bot;
  const ShieldIcon = icons.Shield;
  const UsersIcon = icons.Users;
  const Stethoscope = icons.Stethoscope;
  const Building = icons.Building;
  const BarChart2 = icons.BarChart2;
  const ChevronRight = icons.ChevronRight;
  const ArrowRight = icons.ArrowRight;
  const LayoutDashboard = icons.LayoutDashboard;

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-500/30 transition-colors duration-300 dark:bg-[#0A0F1C] dark:text-slate-50">
      
      {/* Premium Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none z-0" />
      
      {/* Floating Animated Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          style={{ y: y1 }}
          animate={{ x: [0, 30, -20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/10"
        />
        <motion.div 
          style={{ y: y2 }}
          animate={{ x: [0, -40, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/10"
        />
      </div>

      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-b border-slate-200/40 bg-white/70 px-6 md:px-12 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/40 dark:bg-[#0A0F1C]/70">
        <div className="flex items-center gap-3 font-bold text-xl text-blue-600 dark:text-blue-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <ActivityIcon className="h-5 w-5" />
          </div>
          <span className="tracking-tight font-extrabold text-slate-900 dark:text-white">Arogya<span className="text-blue-600 dark:text-blue-500">OS</span></span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">Platform</a>
          <a href="#intelligence" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">Intelligence</a>
          <a href="#security" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors hidden sm:block"
          >
            {t("auth.sign_in")}
          </Link>
          <Link
            href="/dashboard"
            className={`${componentStyles.button.base} ${componentStyles.button.primary} px-6 py-2.5 text-sm shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0`}
          >
            {t("common.access_dashboard")}
          </Link>
        </div>
      </header>

      <main className="relative z-10 w-full pt-32 pb-16">
        
        {/* HERO SECTION */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto w-full pt-12 md:pt-20 pb-20 md:pb-32">
          <div className="grid gap-12 lg:gap-8 lg:grid-cols-2 items-center">
            
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8 max-w-2xl"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-2 text-xs font-semibold text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="tracking-wide uppercase text-[11px] font-bold">Enterprise Healthcare Edition</span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                The Operating System for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Modern Healthcare.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Unify citizens, clinics, pharmacies, laboratories, and district administrators into a single, synchronized, AI-powered intelligence network.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/dashboard"
                  className={`${componentStyles.button.base} ${componentStyles.button.primary} group gap-2 px-8 py-4 text-base shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95`}
                >
                  <span>{t("common.launch_platform")}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="#features"
                  className={`${componentStyles.button.base} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 text-base shadow-sm active:scale-95 group gap-2`}
                >
                  <span>Explore Platform</span>
                </a>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">100%</div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">HIPAA Ready</div>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">&lt;50ms</div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Edge Latency</div>
                </div>
                <div className="w-px h-12 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div className="hidden sm:block">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">99.9%</div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Uptime SLA</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content (Dashboard Mockup) */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
              className="relative hidden lg:block perspective-1000"
            >
              <div className="relative z-10 rounded-2xl border border-slate-200/50 bg-white/40 shadow-2xl overflow-hidden dark:border-slate-800/50 dark:bg-slate-900/40 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0">
                {/* Mockup Topbar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200/40 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                  <div className="mx-auto px-24 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-mono">dashboard.arogyaos.com</span>
                  </div>
                </div>
                {/* Mockup Content */}
                <div className="flex h-[450px]">
                  {/* Sidebar */}
                  <div className="w-48 border-r border-slate-200/40 dark:border-slate-800/40 p-4 space-y-4 bg-white/30 dark:bg-slate-900/30">
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="space-y-2 mt-8">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-8 rounded-md ${i === 1 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-800/50'}`} />
                      ))}
                    </div>
                  </div>
                  {/* Main Area */}
                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-8 w-24 bg-blue-600 rounded-lg shadow-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-col justify-between">
                          <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="h-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-4 relative overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent" />
                       <svg className="w-full h-full text-blue-500/30 stroke-current" viewBox="0 0 100 50" preserveAspectRatio="none">
                         <path d="M0,50 L0,40 Q10,30 20,40 T40,20 T60,30 T80,10 T100,20 L100,50 Z" fill="currentColor" />
                         <path d="M0,40 Q10,30 20,40 T40,20 T60,30 T80,10 T100,20" fill="none" strokeWidth="2" className="text-blue-500 stroke-current" />
                       </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind mockup */}
              <div className="absolute -inset-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[3rem] blur-3xl opacity-20 dark:opacity-30 -z-10" />
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 px-6 md:px-12 bg-white dark:bg-[#0A0F1C] border-y border-slate-200/50 dark:border-slate-800/50 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Enterprise Grade Capabilities</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Built from the ground up to handle complex clinical workflows, secure data governance, and intelligent predictive modeling.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {[
                { icon: BotIcon, title: "Gemini AI Engine", desc: "Medicine shortage predictions, patient inflow forecasting, and instant voice-to-text clinical summaries.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "group-hover:border-blue-200 dark:group-hover:border-blue-800" },
                { icon: ActivityIcon, title: "Real-time Telemetry", desc: "Immediate bed capacity tracking, inventory thresholds, and department occupancy statistics.", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800" },
                { icon: UsersIcon, title: "Role-based Workspaces", desc: "Dedicated interfaces for citizens, doctors, nurses, pharmacists, and district administrators.", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "group-hover:border-indigo-200 dark:group-hover:border-indigo-800" },
                { icon: ShieldIcon, title: "Secure Foundations", desc: "Role claims verification, HIPAA-ready Firestore boundaries, and unified OAuth sessions.", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", border: "group-hover:border-slate-300 dark:group-hover:border-slate-700" },
                { icon: Stethoscope, title: "Clinical Pathways", desc: "Streamlined consultation workflows, integrated e-prescriptions, and longitudinal health records.", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", border: "group-hover:border-rose-200 dark:group-hover:border-rose-800" },
                { icon: BarChart2, title: "Advanced Analytics", desc: "Comprehensive district-wide intelligence, customizable KPI dashboards, and automated reporting.", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "group-hover:border-amber-200 dark:group-hover:border-amber-800" }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  className={`group rounded-2xl border border-slate-200/60 bg-slate-50/50 p-8 dark:border-slate-800/80 dark:bg-slate-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-black/40 ${feature.border} relative overflow-hidden`}
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${feature.bg} ${feature.color} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                  
                  {/* Subtle animated background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/40 dark:group-hover:from-white/5 pointer-events-none transition-colors duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="relative py-24 px-6 md:px-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 z-0" />
          
          {/* Animated rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Ready to modernize your healthcare infrastructure?
            </h2>
            <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
              Join thousands of practitioners and administrators using ArogyaOS to deliver better care, faster.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-bold px-8 py-4 text-base shadow-xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started Now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-blue-700/50 text-white border border-blue-500/50 font-bold px-8 py-4 text-base hover:bg-blue-700/70 active:scale-95 transition-all duration-200"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-[#050810] border-t border-slate-200 dark:border-slate-900 pt-16 pb-8 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white mb-6">
                <ActivityIcon className="h-6 w-6 text-blue-600" />
                <span>ArogyaOS</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs font-medium leading-relaxed">
                The enterprise healthcare operating system built for modern clinical environments, scaling from local clinics to national networks.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors">Security</Link></li>
                <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors">AI Capabilities</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-xs">Company</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors">About</Link></li>
                <li><Link href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} ArogyaOS. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}