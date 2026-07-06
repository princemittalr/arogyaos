'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { DocumentExplorer } from '@/features/medical-documents/components/DocumentExplorer';
import { RecordDetailsDrawer } from '@/features/health-vault/components/RecordDetailsDrawer';
import { VaultOfflineBanner } from '@/features/health-vault/components/VaultOfflineBanner';

export default function MedicalDocumentsPage() {
  const { user } = useAuth();
  const ownerId = user?.uid || '';
  const userRole = user?.role || 'citizen';

  const [selectedRecord, setSelectedRecord] = useState<{ type: string; id: string } | null>(null);

  if (!ownerId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm text-slate-500 dark:text-slate-400">Loading user profile session...</div>
      </div>
    );
  }

  const actorContext = {
    actorId: ownerId,
    actorRole: userRole,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Offline capability status banner */}
      <VaultOfflineBanner />

      <div className="flex flex-col space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Medical Document Explorer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Organize your clinical history records, laboratory findings, and diagnostic files using semantic folders and tags.
        </p>
      </div>

      <DocumentExplorer
        ownerId={ownerId}
        actorContext={actorContext}
        onViewRecordDetails={(type, id) => setSelectedRecord({ type, id })}
      />

      {/* Record details drawer overlay */}
      <RecordDetailsDrawer
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        recordId={selectedRecord?.id || ''}
        recordType={selectedRecord?.type || ''}
        patientId={ownerId}
        userRole={userRole}
        onStatusChanged={() => {
          // Trigger updates if status changes inside the drawer
        }}
      />
    </div>
  );
}
