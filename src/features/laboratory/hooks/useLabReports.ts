import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { LabReportRecord } from '../types';
import { toast } from '@/components/ui/toast';

const vaultService = new HealthVaultService();

export function useLabReports(patientId: string) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['laboratory_reports', patientId],
    queryFn: async () => {
      const q = query(
        collection(db, 'lab_reports'),
        where('ownerId', '==', patientId)
      );
      const snap = await getDocs(q);
      
      const records = snap.docs.map((doc) => doc.data() as LabReportRecord);
      
      // Sort by createdAt / date descending by default
      return records.sort((a, b) => {
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
        return getMs(b.metadata?.createdAt) - getMs(a.metadata?.createdAt);
      });
    },
    enabled: !!patientId,
  });

  const archiveMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await vaultService.archiveRecord('lab_report', recordId, patientId, patientId, 'citizen');
    },
    onSuccess: () => {
      toast.success('Report archived successfully.');
      queryClient.invalidateQueries({ queryKey: ['laboratory_reports', patientId] });
      queryClient.invalidateQueries({ queryKey: ['health_vault_timeline', patientId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive report.');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await vaultService.restoreRecord('lab_report', recordId, patientId, patientId, 'citizen');
    },
    onSuccess: () => {
      toast.success('Report restored successfully.');
      queryClient.invalidateQueries({ queryKey: ['laboratory_reports', patientId] });
      queryClient.invalidateQueries({ queryKey: ['health_vault_timeline', patientId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to restore report.');
    },
  });

  return {
    ...queryResult,
    archiveReport: archiveMutation.mutateAsync,
    restoreReport: restoreMutation.mutateAsync,
    isMutating: archiveMutation.isPending || restoreMutation.isPending,
  };
}
export default useLabReports;
