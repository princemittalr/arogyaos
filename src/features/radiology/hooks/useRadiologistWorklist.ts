import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { RadiologyService } from '../services/RadiologyService';
import { RadiologyStudy, ImagingSeries, DicomMetadataSummary, KeyImageSlice } from '../types';
import { toast } from 'sonner';

export function useRadiologistWorklist(hospitalId: string) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['radiology_worklist', hospitalId],
    queryFn: async () => {
      const q = query(
        collection(db, 'radiology_studies'),
        where('hospitalId', '==', hospitalId)
      );
      const snap = await getDocs(q);
      const records = snap.docs.map((doc) => doc.data() as RadiologyStudy);
      
      // Sort: active/registered scans first, sorted chronologically
      return records.sort((a, b) => {
        const timeA = new Date((a.startedAt || a.completedAt || 0) as string | Date).getTime();
        const timeB = new Date((b.startedAt || b.completedAt || 0) as string | Date).getTime();
        return timeB - timeA;
      });
    },
    enabled: !!hospitalId,
  });

  const startScanMutation = useMutation({
    mutationFn: async (studyInstanceUid: string) => {
      await RadiologyService.startScan(studyInstanceUid);
    },
    onSuccess: (_, studyInstanceUid) => {
      toast.success(`Scan sequence initiated for Study: ${studyInstanceUid}`);
      queryClient.invalidateQueries({ queryKey: ['radiology_worklist', hospitalId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to start scan.');
    },
  });

  const completeScanMutation = useMutation({
    mutationFn: async ({
      studyInstanceUid,
      series,
      dicomMetadata,
    }: {
      studyInstanceUid: string;
      series: ImagingSeries[];
      dicomMetadata?: DicomMetadataSummary;
    }) => {
      await RadiologyService.completeScan(studyInstanceUid, series, dicomMetadata);
    },
    onSuccess: (_, variables) => {
      toast.success(`Scan completed and DICOM metadata ingested for Study: ${variables.studyInstanceUid}`);
      queryClient.invalidateQueries({ queryKey: ['radiology_worklist', hospitalId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to complete scan.');
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (reportData: {
      studyInstanceUid: string;
      patientId: string;
      patientName: string;
      radiologistId: string;
      radiologistName: string;
      findings: string;
      impression: string;
      isCritical: boolean;
      keyImages: KeyImageSlice[];
      attachmentUrl?: string;
      attachmentName?: string;
      attachmentSize?: number;
      attachmentMimeType?: string;
    }) => {
      return await RadiologyService.submitReport(reportData);
    },
    onSuccess: (reportId) => {
      toast.success(`Radiology diagnostic report signed and finalized. Report ID: ${reportId}`);
      queryClient.invalidateQueries({ queryKey: ['radiology_worklist', hospitalId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit clinical report.');
    },
  });

  return {
    ...queryResult,
    startScan: startScanMutation.mutateAsync,
    completeScan: completeScanMutation.mutateAsync,
    submitReport: submitReportMutation.mutateAsync,
    isProcessing:
      startScanMutation.isPending ||
      completeScanMutation.isPending ||
      submitReportMutation.isPending,
  };
}
