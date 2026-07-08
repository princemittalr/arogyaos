'use client';
import { normalizePrescription } from '@/features/prescriptions/utils/normalizePrescription';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PrescriptionRecord } from '../types';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { toast } from '@/components/ui/toast';

const vaultService = new HealthVaultService();

export function usePrescriptions(patientId: string) {
  const queryClient = useQueryClient();

  const queryKey = ['prescriptions', patientId];

  // 1. Fetch prescriptions from Firestore
  const { data, isLoading, error, refetch } = useQuery<PrescriptionRecord[]>({
    queryKey,
    queryFn: async () => {
      const q = query(
        collection(db, 'prescriptions'),
        where('ownerId', '==', patientId)
      );
      const snap = await getDocs(q);
      
      const records = snap.docs.map((d) => normalizePrescription(d) as PrescriptionRecord);
      
      const getMs = (dateVal: unknown) => {
        if (!dateVal) return 0;
        if (typeof dateVal === 'object' && 'toDate' in dateVal) {
          const obj = dateVal as { toDate?: () => unknown };
          if (typeof obj.toDate === 'function') {
            const date = obj.toDate();
            if (date instanceof Date) {
              return date.getTime();
            }
          }
        }
        if (typeof dateVal === 'string') {
          return new Date(dateVal).getTime();
        }
        if (dateVal instanceof Date) {
          return dateVal.getTime();
        }
        return 0;
      };

      return records.sort((a, b) => getMs(b.metadata?.createdAt) - getMs(a.metadata?.createdAt));
    },
    enabled: !!patientId,
  });

  // 2. Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await vaultService.archiveRecord('prescription', recordId, patientId, patientId, 'citizen');
    },
    onSuccess: () => {
      toast.success('Prescription archived successfully.');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive prescription.');
    }
  });

  // 3. Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await vaultService.restoreRecord('prescription', recordId, patientId, patientId, 'citizen');
    },
    onSuccess: () => {
      toast.success('Prescription restored successfully.');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to restore prescription.');
    }
  });

  return {
    prescriptions: data || [],
    isLoading,
    error,
    refetch,
    archive: (id: string) => archiveMutation.mutate(id),
    restore: (id: string) => restoreMutation.mutate(id),
    isArchiving: archiveMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}
export default usePrescriptions;
