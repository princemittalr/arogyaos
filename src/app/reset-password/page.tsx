'use client';

import React, { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { icons } from '@/design-system/icons';

export default function ResetPasswordPage() {
  const Spinner = icons.Loader2;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
