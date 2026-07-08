import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LabService } from '../services/lab.service';
import { LabObservation } from '../types';
import { toast } from '@/components/ui/toast';

export function useTechnicianOrders(hospitalId: string) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ['technician_lab_requests', hospitalId],
    queryFn: () => LabService.getPendingRequests(hospitalId),
    enabled: !!hospitalId,
  });

  const collectSpecimenMutation = useMutation({
    mutationFn: async (vars: { requestId: string; specimenType: string }) => {
      await LabService.collectSpecimen(vars.requestId, vars.specimenType);
    },
    onSuccess: () => {
      toast.success('Specimen collection logged successfully.');
      queryClient.invalidateQueries({ queryKey: ['technician_lab_requests', hospitalId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record specimen collection.');
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (vars: {
      requestId: string;
      technicianId: string;
      technicianName: string;
      observations: Omit<LabObservation, 'status'>[];
    }) => {
      return LabService.submitLabReport(
        vars.requestId,
        vars.technicianId,
        vars.technicianName,
        vars.observations
      );
    },
    onSuccess: () => {
      toast.success('Laboratory diagnostic report uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['technician_lab_requests', hospitalId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit laboratory results.');
    },
  });

  return {
    ...queryResult,
    collectSpecimen: collectSpecimenMutation.mutateAsync,
    submitReport: submitReportMutation.mutateAsync,
    isProcessing: collectSpecimenMutation.isPending || submitReportMutation.isPending,
  };
}
export default useTechnicianOrders;
