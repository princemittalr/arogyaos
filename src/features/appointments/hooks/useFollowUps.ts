'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FollowUpService } from '../services/FollowUpService';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import type { Appointment, FollowUpAppointment } from '../types';

const followUpService = FollowUpService.getInstance();
const appointmentRepo = new AppointmentRepository();

export interface FollowUpSummary {
  upcoming: FollowUpAppointment[];
  overdue: FollowUpAppointment[];
  total: number;
}

export function useFollowUps(patientId: string) {
  const queryResult = useQuery<Appointment[]>({
    queryKey: ['appointments_followups', patientId],
    queryFn: () => appointmentRepo.getByPatientId(patientId),
    enabled: !!patientId,
  });

  const { upcoming, overdue } = useMemo<FollowUpSummary>(() => {
    const data = queryResult.data ?? [];
    const now = new Date();
    const upcomingList: FollowUpAppointment[] = [];
    const overdueList: FollowUpAppointment[] = [];

    for (const appointment of data) {
      if (appointment.appointmentType !== 'FOLLOW_UP') continue;

      const entry: FollowUpAppointment = {
        followUpId: `${appointment.appointmentId}_followup`,
        originalAppointmentId: appointment.referralId ?? appointment.appointmentId,
        patientId: appointment.patientId,
        recommendedDate: appointment.scheduledDate,
        recommendedBy: appointment.providerId,
        reason: appointment.reason ?? 'Follow-up consultation',
        status: appointment.status === 'COMPLETED' ? 'completed' : 'scheduled',
        scheduledAppointmentId: appointment.appointmentId,
      };

      const scheduledDate = new Date(appointment.scheduledDate);
      if (scheduledDate >= now && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED') {
        upcomingList.push(entry);
      } else if (scheduledDate < now && appointment.status === 'SCHEDULED') {
        overdueList.push(entry);
      }
    }

    return {
      upcoming: upcomingList,
      overdue: overdueList,
      total: upcomingList.length + overdueList.length,
    };
  }, [queryResult.data]);

  const suggestedFollowUp = useMemo(() => {
    const data = queryResult.data ?? [];
    const lastCompleted = data
      .filter((a) => a.status === 'COMPLETED')
      .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))[0];

    if (!lastCompleted) return null;

    const suggestion = followUpService.getSuggestedInterval(lastCompleted.appointmentType);
    const recommendedDate = new Date(lastCompleted.scheduledDate);
    recommendedDate.setDate(recommendedDate.getDate() + suggestion.recommendedIntervalDays);

    return {
      appointmentType: lastCompleted.appointmentType,
      recommendedDate: recommendedDate.toISOString().split('T')[0],
      reason: suggestion.reason,
      priority: suggestion.priority,
      intervalDays: suggestion.recommendedIntervalDays,
      providerId: lastCompleted.providerId,
      providerName: lastCompleted.providerName,
    };
  }, [queryResult.data]);

  const isLoading = queryResult.isLoading;

  return {
    upcomingFollowUps: upcoming,
    overdueFollowUps: overdue,
    suggestedFollowUp,
    totalFollowUps: upcoming.length + overdue.length,
    getSuggestedInterval: followUpService.getSuggestedInterval.bind(followUpService),
    isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
