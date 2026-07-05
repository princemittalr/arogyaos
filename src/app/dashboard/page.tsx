'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { getHomeRouteForRole } from '@/config/permissions';
import { icons } from '@/design-system/icons';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const Spinner = icons.Loader2;

  useEffect(() => {
    if (!loading) {
      if (user) {
        const homeRoute = getHomeRouteForRole(user.role);
        router.replace(homeRoute);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center">
      <Spinner className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Verifying security access credentials...
      </p>
    </div>
  );
}
