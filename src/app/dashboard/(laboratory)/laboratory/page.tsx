'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function LaboratoryDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Laboratory Test Desk</h1>
      <p className="text-slate-500">Welcome, Technician {user?.fullName || 'Technician'}. Manage sample collecting requests, test catalogs, and report uploads.</p>
    </div>
  );
}
