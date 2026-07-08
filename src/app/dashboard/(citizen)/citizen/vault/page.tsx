'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { icons } from '@/design-system/icons';
import { useHealthVault, SortOption } from '@/features/health-vault/hooks/useHealthVault';
import { useVirtual } from '@/features/health-vault/hooks/useVirtual';
import { RecordDetailsDrawer } from '@/features/health-vault/components/RecordDetailsDrawer';
import { UploadModal } from '@/features/health-vault/components/UploadModal';
import { VaultOfflineBanner } from '@/features/health-vault/components/VaultOfflineBanner';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';


// Date grouper utility
function getDateGroup(encounterDate: unknown): string {
  const date = (() => {
    if (!encounterDate) return new Date();
    if (typeof (encounterDate as { toDate?: () => Date }).toDate === 'function') {
      return (encounterDate as { toDate: () => Date }).toDate();
    }
    if (encounterDate instanceof Date) return encounterDate;
    return new Date(encounterDate as string | number);
  })();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfThisWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfThisYear = new Date(now.getFullYear(), 0, 1).getTime();

  const time = date.getTime();
  if (time >= startOfToday) return 'Today';
  if (time >= startOfYesterday) return 'Yesterday';
  if (time >= startOfThisWeek) return 'This Week';
  if (time >= startOfThisMonth) return 'This Month';
  if (time >= startOfThisYear) return 'This Year';
  return date.getFullYear().toString();
}

// Category mappings helper
const CATEGORY_TABS = [
  { id: 'all', label: 'All Records', icon: icons.ClipboardList },
  { id: 'prescription', label: 'Prescriptions', icon: icons.Pill },
  { id: 'lab_report', label: 'Laboratory', icon: icons.FlaskConical },
  { id: 'radiology_report', label: 'Radiology', icon: icons.Activity },
  { id: 'vaccination', label: 'Vaccinations', icon: icons.Shield },
  { id: 'consultation', label: 'Consultations', icon: icons.Stethoscope },
  { id: 'medical_certificate', label: 'Certificates', icon: icons.FileText },
  { id: 'discharge_summary', label: 'Discharge Summaries', icon: icons.FileSearch2 },
  { id: 'archived', label: 'Archived Documents', icon: icons.Trash2 },
];

export default function HealthVaultPage() {
  const { user } = useAuth();
  const patientId = user?.uid || '';
  const userRole = user?.role || 'citizen';

  const {
    records,
    loading,
    loadingMore,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    statistics,
    loadMore,
    retry,
    resetFilters,
  } = useHealthVault(patientId);

  // Modal and Drawer UI state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{ id: string; type: string } | null>(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Virtualizer options: each record card is given a fixed rendering height of 135px
  const itemHeight = 135;
  const { containerRef, visibleItems, totalHeight, onScroll } = useVirtual(records, {
    itemHeight,
    overscan: 6,
  });

  // Infinite Scroll Trigger
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(e); // virtualizer handler
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
    if (isAtBottom && hasMore && !loadingMore && !loading) {
      loadMore();
    }
  };

  // Determine empty state details
  const emptyState = useMemo(() => {
    if (loading) return null;
    if (records.length > 0) return null;

    if (searchQuery) {
      return {
        title: 'No search matches',
        desc: `No medical documents match "${searchQuery}". Check spelling or expand filters.`,
        icon: icons.Search,
      };
    }
    if (selectedCategory === 'archived') {
      return {
        title: 'Archived documents empty',
        desc: 'You have not archived any clinical files from your vault index.',
        icon: icons.Trash2,
      };
    }
    if (selectedCategory !== 'all') {
      return {
        title: 'No documents in category',
        desc: 'You currently have no records uploaded in this clinical file section.',
        icon: icons.FileText,
      };
    }
    return {
      title: 'Your Health Vault is empty',
      desc: 'Get started by uploading prescriptions, lab results, vaccinations, or clinical encounter certificates.',
      icon: icons.UploadCloud,
    };
  }, [records, loading, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Offline / sync status banner — renders only when offline or syncing */}
      <VaultOfflineBanner />

      {/* Welcome header & Premium Stats banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <icons.Shield className="h-6 w-6 text-blue-600" />
            Personal Health Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure, immutable, and encrypted clinical records repository.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-600/10 self-start md:self-auto"
        >
          <icons.UploadCloud className="h-4.5 w-4.5" />
          Upload Record
        </button>
      </div>

      {/* Statistics Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vault Records</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{statistics.total}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Prescriptions</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{statistics.prescriptions}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lab & Diagnostics</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{statistics.labReports + statistics.radiology}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Immunizations</p>
          <p className="text-xl font-bold text-purple-600 mt-1">{statistics.vaccinations}</p>
        </div>
      </div>

      {/* Main vault browser layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Categories Navigation Tabs (Sidebar style on desktop) */}
        <nav aria-label="Vault categories" className="space-y-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-2">Category Navigation</p>
          {CATEGORY_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg text-xs font-semibold transition',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                )}
              >
                <TabIcon className="h-4 w-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right 3/4 Columns: Browsing area with Search, Filter panels, and Virtualized Timeline */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search, Filter Toggle, Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <icons.Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, doctor, facility, medicine..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filters toggle + Sorting selectors */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition',
                  showFiltersPanel
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30'
                    : 'bg-white border-slate-100 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350'
                )}
              >
                <icons.Filter className="h-3.5 w-3.5" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] text-white">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="hospital">Hospital A-Z</option>
                <option value="doctor">Doctor A-Z</option>
                <option value="category">Category A-Z</option>
                <option value="recently_updated">Recently Updated</option>
                <option value="alphabetical">Title A-Z</option>
              </select>
            </div>
          </div>

          {/* Collapsible Advanced Filters Panel */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Record Type filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Record Type</label>
                    <select
                      value={filters.recordType || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, recordType: e.target.value || undefined }))}
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs"
                    >
                      <option value="">All Types</option>
                      <option value="prescription">Prescription</option>
                      <option value="lab_report">Lab Report</option>
                      <option value="radiology_report">Radiology</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="consultation">Consultation</option>
                      <option value="medical_certificate">Certificate</option>
                      <option value="discharge_summary">Discharge Summary</option>
                    </select>
                  </div>

                  {/* Doctor Provider Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor Provider</label>
                    <Input
                      type="text"
                      value={filters.doctorName || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, doctorName: e.target.value || undefined }))}
                      placeholder="Search doctor..."
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs"
                    />
                  </div>

                  {/* Hospital Facility Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Facility</label>
                    <Input
                      type="text"
                      value={filters.hospitalName || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, hospitalName: e.target.value || undefined }))}
                      placeholder="Search clinic..."
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs"
                    />
                  </div>

                  {/* Date range filters */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Date</label>
                    <Input
                      type="date"
                      value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: e.target.value ? new Date(e.target.value) : undefined,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To Date</label>
                    <Input
                      type="date"
                      value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: e.target.value ? new Date(e.target.value) : undefined,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs"
                    />
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verification Status</label>
                    <select
                      value={filters.isVerified === undefined ? '' : String(filters.isVerified)}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isVerified: e.target.value === '' ? undefined : e.target.value === 'true',
                        }))
                      }
                      className="w-full rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-2 text-xs"
                    >
                      <option value="">All Statuses</option>
                      <option value="true">Verified E-Record</option>
                      <option value="false">Patient Uploaded</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition px-2.5 py-1.5"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setShowFiltersPanel(false)}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 transition"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central Timeline Feed Container (scroll virtualizer) */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="relative h-[650px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 p-4 scrollbar-thin"
          >
            {/* Loading / Error / Empty UI displays inside timeline */}
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-slate-50 dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-24 max-w-sm mx-auto space-y-3">
                <icons.AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Failed to load timeline records</h3>
                <p className="text-xs text-slate-500">A network interruption occurred. Please re-authenticate or retry query.</p>
                <button
                  onClick={retry}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Retry Connection
                </button>
              </div>
            ) : emptyState ? (
              <div className="text-center py-28 max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                  <emptyState.icon className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{emptyState.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{emptyState.desc}</p>
                </div>
                {searchQuery || Object.keys(filters).length > 0 ? (
                  <button
                    onClick={resetFilters}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Clear Search Filters
                  </button>
                ) : (
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
                  >
                    Upload Document
                  </button>
                )}
              </div>
            ) : (
              // Virtualized Scroll viewport
              <div className="relative w-full" style={{ height: `${totalHeight}px` }}>
                {visibleItems.map(({ item, index, style }) => {
                  const recordDate = (() => {
                    const d = item.encounterDate;
                    if (d && typeof (d as { toDate?: () => Date }).toDate === 'function') {
                      return (d as { toDate: () => Date }).toDate();
                    }
                    return new Date(d as string | number);
                  })();
                  const dateGroup = getDateGroup(recordDate);

                  // Show Group Date Header if first item or index changed group relative to previous
                  const showHeader = index === 0 || getDateGroup(records[index - 1].encounterDate) !== dateGroup;

                  const recordIconMap: Record<string, React.ElementType> = {
                    prescription: icons.Pill,
                    lab_report: icons.FlaskConical,
                    radiology_report: icons.Activity,
                    vaccination: icons.Shield,
                    consultation: icons.Stethoscope,
                    medical_certificate: icons.FileText,
                    discharge_summary: icons.FileSearch2,
                  };
                  const CardIcon = recordIconMap[item.recordType] || icons.FileText;

                  return (
                    <div key={item.indexId} style={style} className="px-1">
                      {/* Optional Group Header placeholder (rendered absolute offset-aligned inside list items to preserve virtual offsets) */}
                      {showHeader && (
                        <div className="absolute -top-5 left-0 z-10 flex items-center gap-2 mb-2 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                          <icons.Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {dateGroup}
                          </span>
                        </div>
                      )}

                      {/* Main Record Card */}
                      <div
                        onClick={() => setSelectedRecord({ id: item.recordId, type: item.recordType })}
                        className={cn(
                          'mt-3 cursor-pointer group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 bg-white hover:bg-slate-50/50 hover:shadow-sm dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700',
                          showHeader ? 'mt-6' : 'mt-2'
                        )}
                        style={{ height: `${itemHeight - (showHeader ? 24 : 10)}px` }}
                      >
                        {/* Category icon */}
                        <div className="rounded-lg p-2.5 bg-slate-50 text-slate-500 dark:bg-slate-850 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition flex-shrink-0">
                          <CardIcon className="h-5 w-5" />
                        </div>

                        {/* Text fields */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 transition">
                            {item.summaryFields.title}
                          </h4>
                          <p className="text-[10px] text-slate-550 mt-1 truncate">
                            {item.summaryFields.providerName} · {item.summaryFields.hospitalName}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Encounter: {format(recordDate, 'PPP')}
                          </p>
                        </div>

                        {/* Right tags & details */}
                        <div className="flex flex-col items-end justify-between h-full flex-shrink-0 text-right">
                          <div className="flex items-center gap-1.5">
                            {item.metadata.verification.isVerified ? (
                              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide border border-emerald-100 dark:border-emerald-900/30">
                                <icons.Check className="h-2 w-2" /> Verified
                              </span>
                            ) : (
                              <span className="rounded bg-slate-50 text-slate-500 dark:bg-slate-850 dark:text-slate-400 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide border border-slate-200/50 dark:border-slate-800">
                                Uploaded
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-semibold mt-auto">
                            <span className="font-mono text-[8px] bg-slate-50 px-1 rounded dark:bg-slate-800">v{item.metadata.version}</span>
                            <span className="flex items-center gap-0.5">
                              <icons.FileText className="h-3 w-3" /> Secure Link
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom loading status for infinite pagination */}
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-500">
                <icons.Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading more clinical history records...</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Record Details Drawer (Lazy loaded) */}
      <RecordDetailsDrawer
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        recordId={selectedRecord?.id || ''}
        recordType={selectedRecord?.type || ''}
        patientId={patientId}
        userRole={userRole}
        onStatusChanged={retry}
      />

      {/* Upload Document Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        patientId={patientId}
        onUploadSuccess={retry}
      />

    </div>
  );
}
