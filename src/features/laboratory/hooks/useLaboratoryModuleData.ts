import { useQuery } from '@tanstack/react-query';
import { LaboratoryMockService, laboratoryMockData } from '../services/LaboratoryMockData';

export function useLaboratoryModuleData(workerId: string, module: keyof typeof laboratoryMockData) {
  return useQuery({
    queryKey: ['laboratory', module, workerId],
    queryFn: () => LaboratoryMockService.getModuleData(workerId, module),
    enabled: !!workerId,
  });
}
