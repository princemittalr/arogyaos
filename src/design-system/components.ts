// Premium design component styling classes matching the Google Stitch UI style
export const componentStyles = {
  card: {
    base: 'rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300',
    hover: 'hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700',
  },
  button: {
    base: 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500',
    outline: 'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-850',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450',
  },
  input: {
    base: 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:placeholder-slate-500 transition-all duration-200',
  },
  table: {
    wrapper: 'w-full overflow-auto rounded-xl border border-slate-100 dark:border-slate-800',
    header: 'bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider',
    row: 'border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors',
  },
} as const;
