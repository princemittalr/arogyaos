'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { LoadingState } from '@/features/shared';

export default function Loading() {const { t } = useLanguage();
  return <LoadingState variant="card" />;
}