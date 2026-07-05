'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export default function NotFound() {
  const AlertCircleIcon = icons.AlertTriangle;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <AlertCircleIcon className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Page Not Found
        </h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className={`${componentStyles.button.base} ${componentStyles.button.primary} px-6 py-3 w-full`}
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
