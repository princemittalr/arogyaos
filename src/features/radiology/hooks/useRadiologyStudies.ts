import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { RadiologyStudy, RadiologyReport } from '../types';
import { toast } from 'sonner';

const vaultService = new HealthVaultService();

export function useRadiologyStudies(patientId: string) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['radiology_studies', patientId],
    queryFn: async () => {
      // 1. Fetch study workflow objects from radiology_studies
      const studiesQ = query(
        collection(db, 'radiology_studies'),
        where('patientId', '==', patientId)
      );
      const studiesSnap = await getDocs(studiesQ);
      const studiesList = studiesSnap.docs.map((doc) => doc.data() as RadiologyStudy);

      // 2. Fetch finalized reports from radiology_reports (ingested via Health Vault)
      const reportsQ = query(
        collection(db, 'radiology_reports'),
        where('ownerId', '==', patientId)
      );
      const reportsSnap = await getDocs(reportsQ);
      const reportsList = reportsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          reportId: doc.id,
          studyInstanceUid: data.studyInstanceUid || '',
          patientId: data.ownerId,
          patientName: data.patientName || '',
          radiologistId: data.radiologistId || '',
          radiologistName: data.radiologistName || '',
          findings: data.findingNotes || '',
          impression: data.impression || '',
          isCritical: data.isCritical || false,
          status: data.metadata?.status === 'ARCHIVED' ? 'cancelled' : 'final',
          signedAt: data.metadata?.createdAt ? (typeof data.metadata.createdAt === 'object' && 'toDate' in data.metadata.createdAt ? (data.metadata.createdAt as { toDate?: () => Date }).toDate?.()?.toISOString() || '' : data.metadata.createdAt) : '',
          keyImages: data.keyImages || [],
          attachmentUrl: data.attachmentUrl,
          attachmentName: data.attachmentName,
          attachmentSize: data.attachmentSize,
          attachmentMimeType: data.attachmentMimeType,
          metadata: data.metadata,
        } as unknown as RadiologyReport & { metadata?: unknown };
      });

      // 3. Join reports onto studies
      const joinedStudies = studiesList.map((study) => {
        const matchingReport = reportsList.find((rep) => rep.studyInstanceUid === study.studyInstanceUid || study.reportId === rep.reportId);
        return {
          ...study,
          report: matchingReport || null,
        };
      });

      // 4. Sort chronologically (completedAt or startedAt descending, fallback to patientId)
      return joinedStudies.sort((a, b) => {
        const dateA = a.completedAt || a.startedAt || 0;
        const dateB = b.completedAt || b.startedAt || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    },
    enabled: !!patientId,
  });

  const archiveMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await vaultService.archiveRecord('radiology_report', reportId, patientId, patientId, 'citizen');
    },
    onSuccess: () => {
      toast.success('Imaging study archived successfully.');
      queryClient.invalidateQueries({ queryKey: ['radiology_studies', patientId] });
      queryClient.invalidateQueries({ queryKey: ['health_vault_timeline', patientId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive study.');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await vaultService.restoreRecord('radiology_report', reportId, patientId, patientId, 'citizen');
    },
    onSuccess: () => {
      toast.success('Imaging study restored successfully.');
      queryClient.invalidateQueries({ queryKey: ['radiology_studies', patientId] });
      queryClient.invalidateQueries({ queryKey: ['health_vault_timeline', patientId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to restore study.');
    },
  });

  return {
    ...queryResult,
    archiveStudy: archiveMutation.mutateAsync,
    restoreStudy: restoreMutation.mutateAsync,
    isMutating: archiveMutation.isPending || restoreMutation.isPending,
  };
}
