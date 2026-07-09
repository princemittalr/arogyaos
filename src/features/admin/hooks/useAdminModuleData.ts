import { useQuery } from '@tanstack/react-query';
import { AdminMockService } from '../services/AdminMockData';
import { isDemoUser } from '@/config/demoAccounts';

export function useAdminModuleData(email?: string | null) {
  return useQuery({
    queryKey: ['admin', 'dashboard', email],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isDemoUser(email)) {
        return AdminMockService.getMockData();
      }
      
      return null;
    },
    enabled: !!email,
  });
}
