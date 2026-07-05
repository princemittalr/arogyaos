import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DistrictService } from '../services/district.service';
import { toast } from 'sonner';

export function useDistrictProfile(districtId: string) {
  return useQuery({
    queryKey: ['district', 'profile', districtId],
    queryFn: () => DistrictService.getProfile(districtId),
    enabled: !!districtId,
  });
}

export function useDistrictFacilities(districtId: string) {
  return useQuery({
    queryKey: ['district', 'facilities', districtId],
    queryFn: () => DistrictService.getFacilities(districtId),
    enabled: !!districtId,
  });
}

export function useDistrictRecommendations(districtId: string) {
  return useQuery({
    queryKey: ['district', 'recommendations', districtId],
    queryFn: () => DistrictService.getRecommendations(districtId),
    enabled: !!districtId,
  });
}

export function useDistrictProposals(districtId: string) {
  return useQuery({
    queryKey: ['district', 'proposals', districtId],
    queryFn: () => DistrictService.getRedistributionProposals(districtId),
    enabled: !!districtId,
  });
}

export function useDistrictAlerts(districtId: string) {
  return useQuery({
    queryKey: ['district', 'alerts', districtId],
    queryFn: () => DistrictService.getAlerts(districtId),
    enabled: !!districtId,
  });
}

export function useDistrictBedStats(districtId: string) {
  return useQuery({
    queryKey: ['district', 'beds', districtId],
    queryFn: () => DistrictService.getBedStats(districtId),
    enabled: !!districtId,
  });
}

export function useDistrictDoctorAttendance(districtId: string) {
  return useQuery({
    queryKey: ['district', 'attendance', districtId],
    queryFn: () => DistrictService.getDoctorAttendanceStats(districtId),
    enabled: !!districtId,
  });
}

export function useResolveProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      proposalId,
      action,
    }: {
      proposalId: string;
      action: 'approve' | 'reject';
      districtId: string;
    }) => {
      return DistrictService.resolveProposal(proposalId, action);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['district', 'proposals', variables.districtId] });
      queryClient.invalidateQueries({ queryKey: ['district', 'facilities', variables.districtId] });
      toast.success(`Proposal ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully.`);
    },
  });
}

export function useResolveRecommendationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recId,
    }: {
      recId: string;
      districtId: string;
    }) => {
      return DistrictService.resolveRecommendation(recId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['district', 'recommendations', variables.districtId] });
      toast.success('Recommendation marked as reviewed.');
    },
  });
}
