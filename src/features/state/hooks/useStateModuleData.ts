import { useQuery } from '@tanstack/react-query';
import { StateMockService } from '../services/StateMockData';
import { isDemoUserId } from '@/config/demoAccounts';

export function useStateModuleData(userId: string) {
  return useQuery({
    queryKey: ['state', 'dashboard', userId],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (await isDemoUserId(userId)) {
        return StateMockService.getMockData();
      }
      
      return null;
    },
    enabled: !!userId,
  });
}
