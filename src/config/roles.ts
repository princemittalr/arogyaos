export type UserRole =
  | 'citizen'
  | 'doctor'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technician'
  | 'hospital_admin'
  | 'district_admin'
  | 'super_admin';

export const ROLES: Record<string, UserRole> = {
  CITIZEN: 'citizen',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician',
  HOSPITAL_ADMIN: 'hospital_admin',
  DISTRICT_ADMIN: 'district_admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const ALL_ROLES = Object.values(ROLES);

export function isValidRole(role: string): role is UserRole {
  return ALL_ROLES.includes(role as UserRole);
}
