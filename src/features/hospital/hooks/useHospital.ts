import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { HospitalService } from '../services/hospital.service';
import type {
  DepartmentDocument,
  StaffDocument,
  RoomDocument,
  BedDocument,
  HospitalInventoryDocument,
  LabTestDocument,
  DetailedDoctorWithUser,
} from '../services/hospital.service';
export type {
  DepartmentDocument,
  StaffDocument,
  RoomDocument,
  BedDocument,
  HospitalInventoryDocument,
  LabTestDocument,
  DetailedDoctorWithUser,
};
import { HospitalProfileDocument, AppointmentDocument } from '@/firebase/types';

// ==========================================
// 1. HOSPITAL PROFILE
// ==========================================
export function useHospitalProfile(hospitalId: string) {
  return useQuery<HospitalProfileDocument>({
    queryKey: ['hospital_profile', hospitalId],
    queryFn: () => HospitalService.getProfile(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useUpdateHospitalProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; data: Partial<HospitalProfileDocument> }) =>
      HospitalService.updateProfile(vars.hospitalId, vars.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_profile', vars.hospitalId] });
      toast.success('Hospital profile updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update hospital profile.');
    },
  });
}

// ==========================================
// 2. DEPARTMENTS
// ==========================================
export function useHospitalDepartments(hospitalId: string) {
  return useQuery<DepartmentDocument[]>({
    queryKey: ['hospital_departments', hospitalId],
    queryFn: () => HospitalService.getDepartments(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { dept: DepartmentDocument }) => HospitalService.saveDepartment(vars.dept),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_departments', vars.dept.hospitalId] });
      toast.success('Department saved successfully.');
    },
    onError: () => {
      toast.error('Failed to save department.');
    },
  });
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; departmentId: string }) =>
      HospitalService.deleteDepartment(vars.departmentId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_departments', vars.hospitalId] });
      toast.success('Department deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete department.');
    },
  });
}

// ==========================================
// 3. DOCTORS
// ==========================================
export function useHospitalDoctors(hospitalId: string) {
  return useQuery<DetailedDoctorWithUser[]>({
    queryKey: ['hospital_doctors', hospitalId],
    queryFn: () => HospitalService.getDoctors(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveDoctorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; docObj: Partial<DetailedDoctorWithUser> }) =>
      HospitalService.saveDoctor(vars.docObj),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_doctors', vars.hospitalId] });
      toast.success('Doctor details updated successfully.');
    },
    onError: () => {
      toast.error('Failed to save doctor details.');
    },
  });
}

export function useDeleteDoctorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; uid: string }) => HospitalService.deleteDoctor(vars.uid),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_doctors', vars.hospitalId] });
      toast.success('Doctor removed from hospital list.');
    },
    onError: () => {
      toast.error('Failed to remove doctor.');
    },
  });
}

// ==========================================
// 4. STAFF
// ==========================================
export function useHospitalStaff(hospitalId: string) {
  return useQuery<StaffDocument[]>({
    queryKey: ['hospital_staff', hospitalId],
    queryFn: () => HospitalService.getStaff(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { staff: StaffDocument }) => HospitalService.saveStaff(vars.staff),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_staff', vars.staff.hospitalId] });
      toast.success('Staff record updated successfully.');
    },
    onError: () => {
      toast.error('Failed to save staff record.');
    },
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; staffId: string }) => HospitalService.deleteStaff(vars.staffId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_staff', vars.hospitalId] });
      toast.success('Staff record removed successfully.');
    },
    onError: () => {
      toast.error('Failed to remove staff record.');
    },
  });
}

// ==========================================
// 5. PATIENTS
// ==========================================
export function useHospitalPatients(hospitalId: string) {
  return useQuery({
    queryKey: ['hospital_patients', hospitalId],
    queryFn: () => HospitalService.getPatients(hospitalId),
    enabled: !!hospitalId,
  });
}

// ==========================================
// 6. APPOINTMENTS
// ==========================================
export function useHospitalAppointments(hospitalId: string) {
  return useQuery<AppointmentDocument[]>({
    queryKey: ['hospital_appointments', hospitalId],
    queryFn: () => HospitalService.getAppointments(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; appointmentId: string; date: string; time: string }) =>
      HospitalService.rescheduleAppointment(vars.appointmentId, vars.date, vars.time),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_appointments', vars.hospitalId] });
      toast.success('Appointment rescheduled successfully.');
    },
    onError: () => {
      toast.error('Failed to reschedule appointment.');
    },
  });
}

export function useUpdateAppointmentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; appointmentId: string; status: AppointmentDocument['status'] }) =>
      HospitalService.updateAppointmentStatus(vars.appointmentId, vars.status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_appointments', vars.hospitalId] });
      toast.success(`Appointment status updated to ${vars.status}.`);
    },
    onError: () => {
      toast.error('Failed to update status.');
    },
  });
}

// ==========================================
// 7. PHARMACY & INVENTORY
// ==========================================
export function useHospitalInventory(hospitalId: string) {
  return useQuery<HospitalInventoryDocument[]>({
    queryKey: ['hospital_inventory', hospitalId],
    queryFn: () => HospitalService.getInventory(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { item: HospitalInventoryDocument }) => HospitalService.saveInventoryItem(vars.item),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_inventory', vars.item.hospitalId] });
      toast.success('Inventory item saved.');
    },
    onError: () => {
      toast.error('Failed to save inventory item.');
    },
  });
}

export function useDeleteInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; inventoryId: string }) =>
      HospitalService.deleteInventoryItem(vars.inventoryId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_inventory', vars.hospitalId] });
      toast.success('Inventory item deleted.');
    },
    onError: () => {
      toast.error('Failed to delete inventory item.');
    },
  });
}

// ==========================================
// 8. ROOMS & BEDS
// ==========================================
export function useHospitalRooms(hospitalId: string) {
  return useQuery<RoomDocument[]>({
    queryKey: ['hospital_rooms', hospitalId],
    queryFn: () => HospitalService.getRooms(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveRoomMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { room: RoomDocument }) => HospitalService.saveRoom(vars.room),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_rooms', vars.room.hospitalId] });
      toast.success('Room record saved.');
    },
    onError: () => {
      toast.error('Failed to save room.');
    },
  });
}

export function useDeleteRoomMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; roomId: string }) => HospitalService.deleteRoom(vars.roomId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_rooms', vars.hospitalId] });
      toast.success('Room record deleted.');
    },
    onError: () => {
      toast.error('Failed to delete room.');
    },
  });
}

export function useHospitalBeds(hospitalId: string) {
  return useQuery<BedDocument[]>({
    queryKey: ['hospital_beds', hospitalId],
    queryFn: () => HospitalService.getBeds(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveBedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { bed: BedDocument }) => HospitalService.saveBed(vars.bed),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_beds', vars.bed.hospitalId] });
      toast.success('Bed status updated.');
    },
    onError: () => {
      toast.error('Failed to update bed.');
    },
  });
}

export function useDeleteBedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; bedId: string }) => HospitalService.deleteBed(vars.bedId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_beds', vars.hospitalId] });
      toast.success('Bed record deleted.');
    },
    onError: () => {
      toast.error('Failed to delete bed.');
    },
  });
}

// ==========================================
// 9. LABORATORY TESTS
// ==========================================
export function useHospitalLabTests(hospitalId: string) {
  return useQuery<LabTestDocument[]>({
    queryKey: ['hospital_lab_tests', hospitalId],
    queryFn: () => HospitalService.getLabTests(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useSaveLabTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { test: LabTestDocument }) => HospitalService.saveLabTest(vars.test),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_lab_tests', vars.test.hospitalId] });
      toast.success('Lab test saved.');
    },
    onError: () => {
      toast.error('Failed to save lab test.');
    },
  });
}

export function useDeleteLabTestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { hospitalId: string; testId: string }) => HospitalService.deleteLabTest(vars.testId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['hospital_lab_tests', vars.hospitalId] });
      toast.success('Lab test deleted.');
    },
    onError: () => {
      toast.error('Failed to delete lab test.');
    },
  });
}
