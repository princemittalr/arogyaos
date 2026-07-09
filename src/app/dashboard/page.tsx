'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { getHomeRouteForRole } from '@/config/permissions';
import { LoadingState } from '@/features/shared';

export default function DashboardRedirectPage() {const { t } = useLanguage();
  const router = useRouter();
  const { user, loading } = useAuth();

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

  return <LoadingState variant="card" />;
}