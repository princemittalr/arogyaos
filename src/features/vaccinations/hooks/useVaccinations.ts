'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Vaccination, AdverseEvent } from '../types';
import { VaccinationService } from '../services/VaccinationService';
import { toast } from 'sonner';

export function useVaccinations(patientId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['vaccinations', patientId];

  const queryResult = useQuery<Vaccination[]>({
    queryKey,
    queryFn: async () => {
      const q = query(
        collection(db, 'vaccinations'),
        where('patientId', '==', patientId)
      );
      const snap = await getDocs(q);
      const records = snap.docs.map((d) => d.data() as Vaccination);
      
      return records.sort((a, b) => {
        const fallbackA = a.metadata?.createdAt ? Number(new Date(a.metadata.createdAt as string)) : 0;
        const fallbackB = b.metadata?.createdAt ? Number(new Date(b.metadata.createdAt as string)) : 0;
        const dateA = a.administeredAt ? new Date(a.administeredAt).getTime() : fallbackA;
        const dateB = b.administeredAt ? new Date(b.administeredAt).getTime() : fallbackB;
        return dateB - dateA;
      });
    },
    enabled: !!patientId,
  });

  const administerMutation = useMutation({
    mutationFn: async ({
      vaccination,
      scheduleId,
    }: {
      vaccination: Omit<Vaccination, 'vaccinationId' | 'status' | 'recordId' | 'metadata'>;
      scheduleId?: string;
    }) => {
      return await VaccinationService.administerVaccine(vaccination, scheduleId);
    },
    onSuccess: (recordId) => {
      toast.success(`Vaccine administered successfully! Record ID: ${recordId}`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['vaccination_schedules', patientId] });
      queryClient.invalidateQueries({ queryKey: ['vaccination_certificates', patientId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record vaccination.');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      vaccinationId,
      verifierSignature,
    }: {
      vaccinationId: string;
      verifierSignature: string;
    }) => {
      return await VaccinationService.verifyVaccine(vaccinationId, verifierSignature);
    },
    onSuccess: (certificateId) => {
      toast.success(`Vaccination verified! Certificate issued: ${certificateId}`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['vaccination_certificates', patientId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to verify vaccination.');
    },
  });

  const adverseEventMutation = useMutation({
    mutationFn: async ({
      vaccinationId,
      adverseEvent,
    }: {
      vaccinationId: string;
      adverseEvent: AdverseEvent;
    }) => {
      await VaccinationService.recordAdverseEvent(vaccinationId, adverseEvent);
    },
    onSuccess: (_, variables) => {
      toast.success(`Adverse event reported for vaccination ${variables.vaccinationId}`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to log adverse event.');
    },
  });

  return {
    vaccinations: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    administerVaccine: administerMutation.mutateAsync,
    verifyVaccine: verifyMutation.mutateAsync,
    recordAdverseEvent: adverseEventMutation.mutateAsync,
    isProcessing:
      administerMutation.isPending ||
      verifyMutation.isPending ||
      adverseEventMutation.isPending,
  };
}
export default useVaccinations;
