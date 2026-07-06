'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PrescriptionService } from '../services/PrescriptionService';
import { RefillTransaction } from '../types';
import { toast } from 'sonner';

const rxService = new PrescriptionService();

export function useRefillTracker(prescriptionId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['prescription_refills', prescriptionId];

  // 1. Get all refill transactions
  const { data: refills, isLoading, error, refetch } = useQuery<RefillTransaction[]>({
    queryKey,
    queryFn: () => rxService.getRefills(prescriptionId),
    enabled: !!prescriptionId,
  });

  // 2. Submit refill request mutation
  const requestRefillMutation = useMutation({
    mutationFn: async (context: {
      quantity: number;
      requesterId: string;
      pharmacyId?: string;
      pharmacyName?: string;
      notes?: string;
    }) => {
      return rxService.requestRefill(prescriptionId, context.quantity, {
        requesterId: context.requesterId,
        pharmacyId: context.pharmacyId,
        pharmacyName: context.pharmacyName,
        notes: context.notes,
      });
    },
    onSuccess: () => {
      toast.success('Refill request submitted successfully.');
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit refill request.');
    },
  });

  return {
    refills: refills || [],
    isLoading,
    error,
    refetch,
    requestRefill: (
      quantity: number,
      requesterId: string,
      pharmacyId?: string,
      pharmacyName?: string,
      notes?: string
    ) =>
      requestRefillMutation.mutate({
        quantity,
        requesterId,
        pharmacyId,
        pharmacyName,
        notes,
      }),
    isRequesting: requestRefillMutation.isPending,
  };
}
export default useRefillTracker;
