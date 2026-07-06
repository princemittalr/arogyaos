'use client';

import React from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LabReportFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  showAbnormalOnly: boolean;
  setShowAbnormalOnly: (show: boolean) => void;
}

export function LabReportFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showAbnormalOnly,
  setShowAbnormalOnly,
}: LabReportFilterBarProps) {
  const categories = [
    { value: 'all', label: 'All Reports' },
    { value: 'active', label: 'Active Reports' },
    { value: 'archived', label: 'Archived Reports' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by test name or laboratory..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
        />
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
        {/* Category Toggles */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/40 p-1 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150',
                selectedCategory === cat.value
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-550 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Abnormal Toggle */}
        <button
          onClick={() => setShowAbnormalOnly(!showAbnormalOnly)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition duration-150',
            showAbnormalOnly
              ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-450'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-350 hover:bg-slate-50'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Abnormal Only</span>
        </button>
      </div>

    </div>
  );
}
