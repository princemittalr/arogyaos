import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { DoctorService } from '../services/doctor.service';
import type {
  DetailedDoctorProfile,
  DetailedPatientProfile,
  DetailedDoctorAppointment,
  LabOrderDocument,
  FollowUpDocument,
} from '../services/doctor.service';
import { PrescriptionDocument } from '@/firebase/types';

// ==========================================
// 1. DOCTOR PROFILE
// ==========================================
export function useDoctorProfile(doctorId: string) {
  return useQuery<DetailedDoctorProfile>({
    queryKey: ['doctor_profile', doctorId],
    queryFn: () => DoctorService.getProfile(doctorId),
    enabled: !!doctorId,
  });
}

export function useUpdateDoctorProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: Partial<DetailedDoctorProfile> }) =>
      DoctorService.updateProfile(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor_profile', variables.doctorId] });
      toast.success('Doctor profile updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update doctor profile.');
    },
  });
}

// ==========================================
// 2. APPOINTMENTS / QUEUE
// ==========================================
export function useDoctorQueue(doctorId: string) {
  return useQuery<DetailedDoctorAppointment[]>({
    queryKey: ['doctor_queue', doctorId],
    queryFn: () => DoctorService.getQueue(doctorId),
    enabled: !!doctorId,
  });
}

// ==========================================
// 3. PATIENTS
// ==========================================
export function useDoctorPatients(doctorId: string) {
  return useQuery<DetailedPatientProfile[]>({
    queryKey: ['doctor_patients', doctorId],
    queryFn: () => DoctorService.getPatients(doctorId),
    enabled: !!doctorId,
  });
}

export function usePatientDetails(patientId: string) {
  return useQuery<DetailedPatientProfile>({
    queryKey: ['patient_details', patientId],
    queryFn: () => DoctorService.getPatientDetails(patientId),
    enabled: !!patientId,
  });
}

// ==========================================
// 4. CONSULTATION & PRESCRIPTIONS
// ==========================================
export function useSaveConsultationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: string;
      data: {
        doctorId: string;
        patientId: string;
        symptoms: string;
        diagnosis: string;
        clinicalNotes: string;
        medicines: Array<{
          medicineId: string;
          name: string;
          dosage: string;
          frequency: string;
          duration: number;
        }>;
        labTests?: string[];
        followUpDate?: string;
      };
    }) => DoctorService.saveConsultation(appointmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor_queue', variables.data.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor_prescriptions', variables.data.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor_lab_orders', variables.data.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor_follow_ups', variables.data.doctorId] });
      toast.success('Consultation saved successfully and prescription built.');
    },
    onError: () => {
      toast.error('Failed to commit consultation.');
    },
  });
}

export function useDoctorPrescriptions(doctorId: string) {
  return useQuery<PrescriptionDocument[]>({
    queryKey: ['doctor_prescriptions', doctorId],
    queryFn: () => DoctorService.getPrescriptions(doctorId),
    enabled: !!doctorId,
  });
}

export function useDoctorLabOrders(doctorId: string) {
  return useQuery<LabOrderDocument[]>({
    queryKey: ['doctor_lab_orders', doctorId],
    queryFn: () => DoctorService.getLabOrders(doctorId),
    enabled: !!doctorId,
  });
}

export function useDoctorFollowUps(doctorId: string) {
  return useQuery<FollowUpDocument[]>({
    queryKey: ['doctor_follow_ups', doctorId],
    queryFn: () => DoctorService.getFollowUps(doctorId),
    enabled: !!doctorId,
  });
}
