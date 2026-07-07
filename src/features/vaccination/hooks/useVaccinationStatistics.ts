'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VaccinationRepository } from '../repositories/VaccinationRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { VACCINATION_STATUS } from '../core/constants';

const vaccinationRepo = new VaccinationRepository();
const scheduleRepo = new ScheduleRepository();

export interface VaccinationStatistics {
  completed: number;
  due: number;
  overdue: number;
  boosters: number;
  coveragePercentage: number;
  upcomingThisMonth: number;
  totalScheduled: number;
  totalVaccinations: number;
}

export function useVaccinationStatistics(patientId: string) {
  const vaccinationsQuery = useQuery({
    queryKey: ['vaccination_stats_vaccinations', patientId],
    queryFn: () => vaccinationRepo.getByPatientId(patientId),
    enabled: !!patientId,
  });

  const schedulesQuery = useQuery({
    queryKey: ['vaccination_stats_schedules', patientId],
    queryFn: () => scheduleRepo.getByPatientId(patientId),
    enabled: !!patientId,
  });

  const statistics = useMemo<VaccinationStatistics>(() => {
    const vaccinations = vaccinationsQuery.data ?? [];
    const schedules = schedulesQuery.data ?? [];
    const now = new Date();

    const completed = vaccinations.filter(
      (v) =>
        v.status === VACCINATION_STATUS.ADMINISTERED ||
        v.status === VACCINATION_STATUS.VERIFIED,
    ).length;

    const due = schedules.filter(
      (s) => s.status === 'DUE',
    ).length;

    const overdue = schedules.filter((s) => {
      if (s.status === 'ADMINISTERED' || s.status === 'CANCELLED') return false;
      const dueDate = s.dueDate instanceof Date ? s.dueDate : new Date(s.dueDate as string);
      return dueDate < now;
    }).length;

    const boosters = vaccinations.filter((v) => {
      if (v.doseNumber === 1 && v.totalDoses === 1) return false;
      if (v.doseNumber > 1) return true;
      return v.category === 'BOOSTER' || v.doseNumber === v.totalDoses;
    }).length;

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const upcomingThisMonth = schedules.filter((s) => {
      if (s.status === 'ADMINISTERED' || s.status === 'CANCELLED') return false;
      const dueDate = s.dueDate instanceof Date ? s.dueDate : new Date(s.dueDate as string);
      return dueDate >= firstOfMonth && dueDate <= lastOfMonth;
    }).length;

    const totalScheduled = schedules.length;
    const totalVaccinations = vaccinations.length;
    const totalExpected = totalScheduled + totalVaccinations;
    const coveragePercentage =
      totalExpected > 0
        ? Math.round((completed / totalExpected) * 100)
        : 0;

    return {
      completed,
      due,
      overdue,
      boosters,
      coveragePercentage,
      upcomingThisMonth,
      totalScheduled,
      totalVaccinations,
    };
  }, [vaccinationsQuery.data, schedulesQuery.data]);

  const isLoading = vaccinationsQuery.isLoading || schedulesQuery.isLoading;

  return {
    ...statistics,
    isLoading,
    error: vaccinationsQuery.error || schedulesQuery.error,
    refetch: () => {
      vaccinationsQuery.refetch();
      schedulesQuery.refetch();
    },
  };
}
