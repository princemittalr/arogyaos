'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { PRESCRIPTION_STATUSES } from '../core/constants';
import { PrescriptionStatus } from '../types';
import { Input } from '@/components/ui/input';


interface PrescriptionFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: PrescriptionStatus | 'all';
  setSelectedStatus: (status: PrescriptionStatus | 'all') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClear: () => void;
}

export function PrescriptionFilterBar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  onClear,
}: PrescriptionFilterBarProps) {
  const hasActiveFilters = searchQuery !== '' || selectedStatus !== 'all';

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4.5 w-4.5" />
        </span>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by medicine, doctor, or diagnosis..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filter / Sort Actions */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span>Status:</span>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as PrescriptionStatus | 'all')}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="all">All Prescriptions</option>
          {PRESCRIPTION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="doctor">Doctor Name (A-Z)</option>
          <option value="hospital">Hospital (A-Z)</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold px-2 py-1.5 bg-red-50 dark:bg-red-950/20 rounded-lg transition-colors ml-auto md:ml-0"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default PrescriptionFilterBar;
