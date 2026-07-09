import { useQuery } from '@tanstack/react-query';
import { NurseMockService, nurseMockData } from '../services/NurseMockData';

export function useNurseModuleData(workerId: string, module: keyof typeof nurseMockData) {
  return useQuery({
    queryKey: ['nurse', module, workerId],
    queryFn: () => NurseMockService.getModuleData(workerId, module),
    enabled: !!workerId,
  });
}
