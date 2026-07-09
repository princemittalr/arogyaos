import { useQuery } from '@tanstack/react-query';
import { AshaMockService, ashaMockData } from '../services/AshaMockData';

export function useAshaModuleData(workerId: string, module: keyof typeof ashaMockData) {
  return useQuery({
    queryKey: ['asha', module, workerId],
    queryFn: () => AshaMockService.getModuleData(workerId, module),
    enabled: !!workerId,
  });
}
