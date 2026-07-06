'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { LoadingState } from '../widgets/LoadingState';
import { icons } from '@/design-system/icons';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

export function DataTable<T extends Record<string, any>>({ // eslint-disable-line @typescript-eslint/no-explicit-any
  columns,
  data,
  loading,
  emptyMessage = 'No matching records found in this view.',
  pagination,
  className
}: DataTableProps<T>) {const { t } = useLanguage();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const ChevronDownIcon = icons.ChevronDown;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const factor = sortOrder === 'asc' ? 1 : -1;
      return aVal < bVal ? -factor : factor;
    });
  }, [data, sortKey, sortOrder]);

  return (
    <div className={cn('w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm" aria-label={t("common.data_table", "Data Table")}>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const ariaSortVal = isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={col.sortable ? (ariaSortVal || 'none') : undefined}
                    className="px-6 py-4 select-none"
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                        aria-label={`${t("common.sort_by", "Sort by")} ${col.header}, ${isSorted ? (sortOrder === 'asc' ? t("common.sorted_ascending", "sorted ascending") : t("common.sorted_descending", "sorted descending")) : t("common.unsorted", "unsorted")}`}
                      >
                        {col.header}
                        <ChevronDownIcon
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-200',
                            isSorted && sortOrder === 'desc' ? 'rotate-180' : '',
                            isSorted ? 'opacity-100' : 'opacity-40'
                          )}
                        />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ?
            <tr>
                <td colSpan={columns.length} className="px-6 py-8">
                  <LoadingState variant="table" rows={4} className="border-none p-0 bg-transparent" />
                </td>
              </tr> :
            sortedData.length === 0 ?
            <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </td>
              </tr> :

            sortedData.map((row, rowIdx) =>
            <tr
              key={row.id || rowIdx}
              className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 last:border-b-0 transition-colors">
              
                  {columns.map((col) => {
                const cellVal = row[col.key];
                return (
                  <td key={col.key} className="px-6 py-4 text-slate-700 dark:text-slate-350 font-medium">
                        {col.render ? col.render(cellVal, row) : cellVal}
                      </td>);

              })}
                </tr>
            )
            }
          </tbody>
        </table>
      </div>

      {pagination &&
      <nav aria-label={t("common.pagination", "Pagination Navigation")} className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950/40">
          <span className="text-xs text-slate-500 dark:text-slate-400">{t("common.page")}
          {pagination.currentPage}{t("common.of")}{pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
            type="button"
            disabled={pagination.currentPage <= 1 || loading}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 transition">{t("common.previous")}


          </button>
            <button
            type="button"
            disabled={pagination.currentPage >= pagination.totalPages || loading}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 transition">{t("common.next")}


          </button>
          </div>
        </nav>
      }
    </div>);

}
export default DataTable;