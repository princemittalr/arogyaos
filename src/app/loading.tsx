'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { icons } from '@/design-system/icons';

export default function Loading() {
  const Spinner = icons.Loader2;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="mb-4 text-blue-600 dark:text-blue-400"
        >
          <Spinner className="h-10 w-10" />
        </motion.div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading ArogyaOS...
        </p>
      </div>
    </div>
  );
}
