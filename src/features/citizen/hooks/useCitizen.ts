'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { CitizenService, CombinedPatientProfile } from '../services/citizen.service';

export function useCitizenProfile(uid: string) {
  return useQuery({
    queryKey: ['citizen_profile', uid],
    queryFn: () => CitizenService.getProfile(uid),
    enabled: !!uid,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<CombinedPatientProfile> }) =>
      CitizenService.updateProfile(uid, data),
    onSuccess: (_, variables) => {
      toast.success('Medical profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['citizen_profile', variables.uid] });
      queryClient.invalidateQueries({ queryKey: ['auth_user'] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to update profile.');
    },
  });
}

export function useFamilyMembers(uid: string) {
  return useQuery({
    queryKey: ['family_members', uid],
    queryFn: () => CitizenService.getFamilyMembers(uid),
    enabled: !!uid,
  });
}

export function useAddFamilyMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      member,
    }: {
      uid: string;
      member: { fullName: string; relation: string; age: number };
    }) => CitizenService.addFamilyMember(uid, member),
    onSuccess: (_, variables) => {
      toast.success('Family member added successfully.');
      queryClient.invalidateQueries({ queryKey: ['family_members', variables.uid] });
      queryClient.invalidateQueries({ queryKey: ['citizen_profile', variables.uid] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to add family member.');
    },
  });
}

export function useRemoveFamilyMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, fullName }: { uid: string; fullName: string }) =>
      CitizenService.removeFamilyMember(uid, fullName),
    onSuccess: (_, variables) => {
      toast.success('Family member removed successfully.');
      queryClient.invalidateQueries({ queryKey: ['family_members', variables.uid] });
      queryClient.invalidateQueries({ queryKey: ['citizen_profile', variables.uid] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to remove family member.');
    },
  });
}

export function useHospitals() {
  return useQuery({
    queryKey: ['hospitals_list'],
    queryFn: () => CitizenService.getHospitals(),
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors_list'],
    queryFn: () => CitizenService.getDoctors(),
  });
}

export function useAppointments(patientId: string) {
  return useQuery({
    queryKey: ['appointments', patientId],
    queryFn: () => CitizenService.getAppointments(patientId),
    enabled: !!patientId,
  });
}

export function useBookAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      doctorId,
      hospitalId,
      date,
      time,
    }: {
      patientId: string;
      doctorId: string;
      hospitalId: string;
      date: string;
      time: string;
    }) => CitizenService.bookAppointment(patientId, doctorId, hospitalId, date, time),
    onSuccess: (_, variables) => {
      toast.success('Appointment scheduled successfully.');
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.patientId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to schedule appointment.');
    },
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { appointmentId: string; patientId: string }) =>
      CitizenService.cancelAppointment(vars.appointmentId),
    onSuccess: (_, variables) => {
      toast.success('Appointment cancelled successfully.');
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.patientId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to cancel appointment.');
    },
  });
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { appointmentId: string; patientId: string; date: string; time: string }) =>
      CitizenService.rescheduleAppointment(vars.appointmentId, vars.date, vars.time),
    onSuccess: (_, variables) => {
      toast.success('Appointment rescheduled successfully.');
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.patientId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Failed to reschedule appointment.');
    },
  });
}

export function usePrescriptions(patientId: string) {
  return useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => CitizenService.getPrescriptions(patientId),
    enabled: !!patientId,
  });
}

export function useReports(patientId: string) {
  return useQuery({
    queryKey: ['reports', patientId],
    queryFn: () => CitizenService.getReports(patientId),
    enabled: !!patientId,
  });
}

export function useNotifications(patientId: string) {
  return useQuery({
    queryKey: ['notifications', patientId],
    queryFn: () => CitizenService.getNotifications(patientId),
    enabled: !!patientId,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { notificationId: string; patientId: string }) =>
      CitizenService.markNotificationRead(vars.notificationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', variables.patientId] });
    },
  });
}
