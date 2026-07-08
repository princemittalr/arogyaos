'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VaccinationSchedule } from '../types';
import { VaccinationService } from '../services/VaccinationService';
import { toast } from '@/components/ui/toast';

export function useUpcomingVaccines(patientId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['vaccination_schedules', patientId];

  const queryResult = useQuery<VaccinationSchedule[]>({
    queryKey,
    queryFn: async () => {
      const q = query(
        collection(db, 'vaccination_schedules'),
        where('patientId', '==', patientId)
      );
      const snap = await getDocs(q);
      const records = snap.docs.map((d) => d.data() as VaccinationSchedule);
      
      // Filter out administered schedules and sort upcoming chronologically
      return records
        .filter((r) => r.status === 'scheduled' || r.status === 'due')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },
    enabled: !!patientId,
  });

  const scheduleMutation = useMutation({
    mutationFn: async (scheduleData: Omit<VaccinationSchedule, 'scheduleId' | 'status'>) => {
      return await VaccinationService.scheduleVaccine(scheduleData);
    },
    onSuccess: (scheduleId) => {
      toast.success(`Vaccine dose scheduled successfully! ID: ${scheduleId}`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to schedule vaccination.');
    },
  });

  return {
    schedules: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    scheduleVaccine: scheduleMutation.mutateAsync,
    isScheduling: scheduleMutation.isPending,
  };
}
export default useUpcomingVaccines;
