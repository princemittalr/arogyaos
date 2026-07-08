'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';
import { useLanguage } from '@/providers/LanguageProvider';
import { Input } from '@/components/ui/input';


interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search data directory...', className }: SearchBarProps) {
  const { t } = useLanguage();
  const SearchIcon = icons.Search;
  const XIcon = icons.X;

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <SearchIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(componentStyles.input.base, 'pl-10 pr-9 py-2 text-sm')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t("common.clear_search", "Clear search")}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition"
        >
          <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
export default SearchBar;
