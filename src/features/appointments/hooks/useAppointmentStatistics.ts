'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { WaitingListRepository } from '../repositories/WaitingListRepository';

const appointmentRepo = new AppointmentRepository();
const waitingListRepo = new WaitingListRepository();

export interface AppointmentStatistics {
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  total: number;
  utilisationPercentage: number;
  averagePerDay: number;
  waitingListCount: number;
}

export function useAppointmentStatistics(patientId: string) {
  const appointmentsQuery = useQuery({
    queryKey: ['appointments_stats_appointments', patientId],
    queryFn: () => appointmentRepo.getByPatientId(patientId),
    enabled: !!patientId,
  });

  const waitingListQuery = useQuery({
    queryKey: ['appointments_stats_waiting', patientId],
    queryFn: () => waitingListRepo.getByPatient(patientId),
    enabled: !!patientId,
  });

  const statistics = useMemo<AppointmentStatistics>(() => {
    const appointments = appointmentsQuery.data ?? [];
    const waitingEntries = waitingListQuery.data ?? [];

    const scheduled = appointments.filter((a) => a.status === 'SCHEDULED').length;
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShow = appointments.filter((a) => a.status === 'NO_SHOW').length;
    const total = appointments.length;

    const totalUtilised = completed;
    const totalBooked = scheduled + confirmed + completed;
    const utilisationPercentage = totalBooked > 0
      ? Math.round((totalUtilised / totalBooked) * 100)
      : 0;

    const dates = appointments.map((a) => new Date(a.scheduledDate).toISOString().split('T')[0]);
    const uniqueDays = new Set(dates).size;
    const averagePerDay = uniqueDays > 0 ? Math.round((total / uniqueDays) * 10) / 10 : 0;

    const waitingListCount = waitingEntries.filter((e) => e.status === 'waiting').length;

    return {
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShow,
      total,
      utilisationPercentage,
      averagePerDay,
      waitingListCount,
    };
  }, [appointmentsQuery.data, waitingListQuery.data]);

  const isLoading = appointmentsQuery.isLoading || waitingListQuery.isLoading;

  return {
    ...statistics,
    isLoading,
    error: appointmentsQuery.error || waitingListQuery.error,
    refetch: () => {
      appointmentsQuery.refetch();
      waitingListQuery.refetch();
    },
  };
}
