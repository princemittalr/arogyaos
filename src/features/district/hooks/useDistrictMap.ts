import { useQuery } from '@tanstack/react-query';
import { DistrictMapService, DistrictFacilityNode } from '../services/DistrictMapData';

export function useDistrictMap(userId: string) {
  return useQuery<DistrictFacilityNode[]>({
    queryKey: ['districtMap', userId],
    queryFn: () => DistrictMapService.getFacilities(userId),
    enabled: !!userId,
  });
}
