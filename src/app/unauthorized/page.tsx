'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { icons } from '@/design-system/icons';
import { componentStyles } from '@/design-system/components';

export default function UnauthorizedPage() {
  const AlertIcon = icons.AlertTriangle;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`${componentStyles.card.base} p-8 max-w-md w-full text-center space-y-6`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <AlertIcon className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Access Denied
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You do not possess the required healthcare role clearances to access this workspace area.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/login"
            className={`${componentStyles.button.base} ${componentStyles.button.primary} w-full py-3`}
          >
            Sign In with Different Account
          </Link>
          <Link
            href="/"
            className={`${componentStyles.button.base} ${componentStyles.button.outline} w-full py-3`}
          >
            Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
