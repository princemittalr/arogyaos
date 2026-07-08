export const componentStyles = {
  card: {
    base: 'rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-[#0f172a] transition-all duration-300',
    hover: 'hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-200 hover:-translate-y-0.5 dark:hover:shadow-black/50 dark:hover:border-slate-700',
  },
  button: {
    base: 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 dark:bg-blue-600 dark:hover:bg-blue-500 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500',
    outline: 'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus:ring-slate-500',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 focus:ring-red-500',
  },
  input: {
    base: 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-[#0a0f1e] dark:text-slate-50 dark:placeholder-slate-500 transition-all duration-200',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-900/50',
  },
  table: {
    wrapper: 'w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm',
    header: 'bg-slate-50/80 dark:bg-slate-900/80 text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-4 border-b border-slate-200 dark:border-slate-800',
    row: 'border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors',
    cell: 'py-3.5 px-4 text-sm text-slate-700 dark:text-slate-300',
  },
  badge: {
    base: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide transition-colors',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    error: 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  emptyState: {
    wrapper: 'flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20',
    icon: 'h-12 w-12 text-slate-300 dark:text-slate-600 mb-4',
    title: 'text-lg font-bold text-slate-900 dark:text-white mb-2',
    description: 'text-sm text-slate-500 dark:text-slate-400 max-w-sm',
  }
} as const;
