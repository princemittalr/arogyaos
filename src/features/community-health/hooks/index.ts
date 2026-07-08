import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Visit } from '../types';
import { CommunityHealthService } from '../services/CommunityHealthService';

// Note: In a real implementation, the service instance would be injected or exported from a di container.
// We mock it here for the hook signature.
const mockService = {} as CommunityHealthService;

export function useCommunityDashboard(workerId: string) {
  return useQuery({
    queryKey: ['community', 'dashboard', workerId],
    queryFn: () => mockService.getDashboardOverview(workerId),
  });
}

export function useScheduleVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (visit: Omit<Visit, 'id'>) => mockService.recordVisitOffline(visit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'dashboard'] });
    },
  });
}

export function useEmergencyReferral() {
  return useMutation({
    mutationFn: ({ memberId, reason, facilityId }: { memberId: string, reason: string, facilityId: string }) => 
      mockService.escalateEmergency(memberId, reason, facilityId),
  });
}
