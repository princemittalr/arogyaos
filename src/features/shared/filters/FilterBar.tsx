'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { cn } from '@/utils/cn';
import { componentStyles } from '@/design-system/components';

interface FilterOption {
  key: string;
  label: string;
  choices: {label: string;value: string;}[];
}

interface FilterBarProps {
  options: FilterOption[];
  selectedFilters: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  options,
  selectedFilters,
  onChange,
  onClearAll,
  className
}: FilterBarProps) {const { t } = useLanguage();
  const hasActiveFilters = Object.values(selectedFilters).some((val) => val !== '');

  return (
    <div className={cn('flex flex-wrap items-center gap-3.5', className)}>
      {options.map((opt) =>
      <div key={opt.key} className="flex flex-col gap-1">
          <select
          value={selectedFilters[opt.key] || ''}
          onChange={(e) => onChange(opt.key, e.target.value)}
          className={cn(
            componentStyles.input.base,
            'py-2 px-3 text-xs w-auto min-w-[130px] font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          )}>
          
            <option value="">{opt.label}</option>
            {opt.choices.map((choice) =>
          <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
          )}
          </select>
        </div>
      )}

      {hasActiveFilters && onClearAll &&
      <button
        onClick={onClearAll}
        className="text-xs font-bold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 select-none py-1.5 transition">{t("common.clear_filters")}


      </button>
      }
    </div>);

}
export default FilterBar;