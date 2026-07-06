'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePharmacyInventory, useDispenseHistory } from '@/features/pharmacy/hooks/usePharmacy';
import { LoadingState } from '@/features/shared';
import {
  Package, AlertTriangle, CheckCircle2, TrendingUp, Bot, ArrowRight,
  Clock, Flame, BarChart2 } from
'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import dynamic from 'next/dynamic';

const StockTrendChart = dynamic(() => import('@/features/shared/charts/StockTrendChart'), {
  ssr: false,
  loading: () => <div className="h-52 w-full bg-slate-50 dark:bg-slate-950 animate-pulse rounded-lg" />
});

const TREND_DATA = [
{ month: 'Jan', stock: 2400, dispensed: 400 },
{ month: 'Feb', stock: 2200, dispensed: 300 },
{ month: 'Mar', stock: 2600, dispensed: 500 },
{ month: 'Apr', stock: 2300, dispensed: 450 },
{ month: 'May', stock: 2800, dispensed: 600 },
{ month: 'Jun', stock: 3100, dispensed: 550 }];


export default function PharmacyDashboardPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_city_gen';

  const { data: inventory, isLoading: isInvLoading } = usePharmacyInventory(hospitalId);
  const { data: history, isLoading: isHistLoading } = useDispenseHistory(hospitalId);

  if (isInvLoading || isHistLoading) return <LoadingState variant="card" />;

  const items = inventory || [];
  const logs = history || [];
  const today = new Date();
  const in30Days = new Date();in30Days.setDate(today.getDate() + 30);

  const totalMeds = items.length;
  const outOfStock = items.filter((i) => i.quantity <= 0).length;
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= i.minimumStock).length;
  const expiringSoon = items.filter((i) => {const d = new Date(i.expiryDate);return d > today && d <= in30Days;}).length;
  const expired = items.filter((i) => new Date(i.expiryDate) <= today).length;
  const healthy = items.filter((i) => i.quantity > i.minimumStock && new Date(i.expiryDate) > today).length;
  const healthScore = totalMeds > 0 ? Math.round(healthy / totalMeds * 100) : 100;

  const todayStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t("pharmacy.pharmacy_control_center")}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{todayStr}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pharmacy/dispense" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm">
            <Clock className="h-3.5 w-3.5" />{t("pharmacy.dispense_queue")}
          </Link>
          <Link href="/dashboard/pharmacy/ai-forecast" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Bot className="h-3.5 w-3.5" />{t("pharmacy.ai_forecast")}
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
        {
          label: t("pharmacy.inventory_health"), value: `${healthScore}%`, sub: `${healthy} healthy items`, icon: CheckCircle2,
          variant: healthScore > 80 ? 'success' : healthScore > 60 ? 'warning' : 'danger', href: '/dashboard/pharmacy/inventory'
        },
        {
          label: t("pharmacy.total_medicines"), value: totalMeds, sub: t("pharmacy.unique_skus_tracked"), icon: Package,
          variant: 'default', href: '/dashboard/pharmacy/medicines'
        },
        {
          label: t("pharmacy.stock_warnings"), value: lowStock + outOfStock, sub: `${lowStock} low · ${outOfStock} empty`, icon: AlertTriangle,
          variant: lowStock + outOfStock > 0 ? 'danger' : 'success', href: '/dashboard/pharmacy/inventory'
        },
        {
          label: t("pharmacy.expiry_alerts"), value: expiringSoon + expired, sub: `${expiringSoon} expiring · ${expired} expired`, icon: Flame,
          variant: expiringSoon + expired > 0 ? 'warning' : 'success', href: '/dashboard/pharmacy/expiry'
        }].
        map((kpi, i) => {
          const colors: Record<string, string> = {
            success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
            warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
            danger: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
            default: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
          };
          const card =
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-700 transition">
              <div className={cn('inline-flex rounded-lg p-2', colors[kpi.variant])}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
            </div>;

          return <Link key={i} href={kpi.href}>{card}</Link>;
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stock Trend Chart */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("pharmacy.stock_vs_dispensing_trend")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t("pharmacy.monthly_inventory_rotation_overview")}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="h-52" role="img" aria-label={t("pharmacy.stock_vs_dispensing_trend")}>
              <div className="sr-only">
                {t("pharmacy.chart_description", "Chart showing stock vs dispensing trend. Data: Jan - Stock 2400, Dispensed 400; Feb - Stock 1398, Dispensed 3000; Mar - Stock 9800, Dispensed 2000; Apr - Stock 3908, Dispensed 2780; May - Stock 4800, Dispensed 1890; Jun - Stock 3800, Dispensed 2390; Jul - Stock 4300, Dispensed 3490.")}
              </div>
              <StockTrendChart data={TREND_DATA} stockLabel={t("pharmacy.stock_level")} dispensedLabel={t("pharmacy.dispensed")} />
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="h-2 w-4 rounded-full bg-blue-500 opacity-80" /><span className="text-[11px] text-slate-500">{t("pharmacy.stock_level")}</span></div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-4 rounded-full bg-emerald-500 opacity-80" /><span className="text-[11px] text-slate-500">{t("pharmacy.dispensed")}</span></div>
            </div>
          </div>

          {/* Recent Dispensing */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("pharmacy.recent_dispensing_activity")}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t("pharmacy.audit_trail_of_outgoing_medications")}</p>
              </div>
              <Link href="/dashboard/pharmacy/dispense" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("pharmacy.see_all")}</Link>
            </div>
            {logs.length === 0 ?
            <div className="flex flex-col items-center py-8 text-center">
                <Package className="h-8 w-8 text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">{t("pharmacy.no_dispensing_logs_recorded_yet")}</p>
              </div> :

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.slice(0, 5).map((log) =>
              <div key={log.dispenseId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{log.patientName}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {log.medicines.slice(0, 2).map((m) => `${m.name} ×${m.quantity}`).join(', ')}
                          {log.medicines.length > 2 && ` +${log.medicines.length - 2} more`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                      {log.dispensedAt.split('T')[1]?.slice(0, 5)}
                    </span>
                  </div>
              )}
              </div>
            }
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* AI Forecast */}
          <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/30 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">{t("pharmacy.ai_stock_forecast")}</h2>
              </div>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">{t("pharmacy.gemini")}</span>
            </div>
            <div className="rounded-lg bg-white/70 dark:bg-slate-900/50 p-3.5 border border-white dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 text-[9px] font-bold uppercase">{t("pharmacy.critical")}</span>
                <span className="text-[10px] font-semibold text-slate-400">{t("pharmacy.87_confidence")}</span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{t("pharmacy.metformin_500mg_forecasted_to_deplete_within_3_days_based_on_monsoon_season_prescription_trends_recommend_procurement_of_5000_tablets_immediately")}

              </p>
            </div>
            <Link href="/dashboard/pharmacy/ai-forecast" className="mt-4 flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">{t("pharmacy.full_ai_forecast_report")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Quick Operations */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{t("pharmacy.operations_panel")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
              { label: t("pharmacy.dispense_rx"), icon: Clock, href: '/dashboard/pharmacy/dispense', primary: true },
              { label: t("pharmacy.manage_stock"), icon: Package, href: '/dashboard/pharmacy/inventory', primary: false },
              { label: t("pharmacy.expiry_check"), icon: Flame, href: '/dashboard/pharmacy/expiry', primary: false },
              { label: t("pharmacy.reports"), icon: BarChart2, href: '/dashboard/pharmacy/reports', primary: false }].
              map((item) =>
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg p-3.5 text-center transition text-xs font-semibold',
                  item.primary ?
                  'bg-blue-600 hover:bg-blue-700 text-white' :
                  'border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                )}>
                
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )}
            </div>
          </div>

          {/* Inventory Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">{t("pharmacy.inventory_breakdown")}</h2>
            <div className="space-y-3">
              {[
              { label: t("pharmacy.healthy_stock"), value: healthy, total: totalMeds, color: 'bg-emerald-500' },
              { label: t("pharmacy.low_stock"), value: lowStock, total: totalMeds, color: 'bg-amber-500' },
              { label: t("pharmacy.out_of_stock"), value: outOfStock, total: totalMeds, color: 'bg-red-500' }].
              map((item) =>
              <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                    className={cn('h-1.5 rounded-full', item.color)}
                    style={{ width: `${totalMeds > 0 ? item.value / totalMeds * 100 : 0}%` }} />
                  
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

}