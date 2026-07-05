'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';
import { logger } from '@/utils/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const AlertIcon = icons.AlertTriangle;

  useEffect(() => {
    logger.error('Unhandled app error captured by boundary', {
      tag: 'error-boundary',
      data: { message: error.message, digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <AlertIcon className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Something went wrong
        </h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          An unexpected error occurred in the system. Our health check logs have captured this event.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className={`${componentStyles.button.base} ${componentStyles.button.primary} px-6 py-3 w-full`}
          >
            Try Again
          </button>
          <Link
            href="/"
            className={`${componentStyles.button.base} ${componentStyles.button.outline} px-6 py-3 w-full`}
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
