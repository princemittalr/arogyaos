'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Vaccination, VaccinationSchedule } from '../types';

export function useBoosterTracker(patientId: string) {
  const queryResult = useQuery({
    queryKey: ['booster_tracker', patientId],
    queryFn: async () => {
      // 1. Fetch administered vaccines
      const vacQuery = query(
        collection(db, 'vaccinations'),
        where('patientId', '==', patientId)
      );
      const vacSnap = await getDocs(vacQuery);
      const vaccinations = vacSnap.docs.map((d) => d.data() as Vaccination);

      // 2. Fetch schedules
      const schedQuery = query(
        collection(db, 'vaccination_schedules'),
        where('patientId', '==', patientId)
      );
      const schedSnap = await getDocs(schedQuery);
      const schedules = schedSnap.docs.map((d) => d.data() as VaccinationSchedule);

      // Filter boosters (category 'booster' or doseNumber > 1)
      const administeredBoosters = vaccinations.filter(
        (v) => v.category === 'booster' || (v.totalDoses > 1 && v.doseNumber > 1)
      );

      const upcomingBoosters = schedules.filter(
        (s) =>
          (s.status === 'scheduled' || s.status === 'due') &&
          (s.category === 'booster' || (s.totalDoses > 1 && s.doseNumber > 1))
      );

      return {
        administeredBoosters,
        upcomingBoosters,
        totalTracked: administeredBoosters.length + upcomingBoosters.length,
      };
    },
    enabled: !!patientId,
  });

  return {
    administeredBoosters: queryResult.data?.administeredBoosters || [],
    upcomingBoosters: queryResult.data?.upcomingBoosters || [],
    totalTracked: queryResult.data?.totalTracked || 0,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
export default useBoosterTracker;
