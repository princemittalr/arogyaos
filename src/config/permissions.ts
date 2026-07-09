import { UserRole } from './roles';
import { ROUTES } from './routes';

export type Permission =
  | 'view_citizen_dashboard'
  | 'view_asha_dashboard'
  | 'view_doctor_dashboard'
  | 'view_nurse_dashboard'
  | 'view_hospital_dashboard'
  | 'view_pharmacy_dashboard'
  | 'view_laboratory_dashboard'
  | 'view_district_dashboard'
  | 'view_state_dashboard'
  | 'view_admin_dashboard'
  | 'manage_users'
  | 'manage_redistribution';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  citizen: ['view_citizen_dashboard'],
  asha_worker: ['view_asha_dashboard'],
  doctor: ['view_doctor_dashboard'],
  nurse: ['view_nurse_dashboard'],
  pharmacist: ['view_pharmacy_dashboard'],
  lab_technician: ['view_laboratory_dashboard'],
  hospital_admin: ['view_hospital_dashboard'],
  district_admin: ['view_district_dashboard', 'manage_redistribution'],
  state_admin: ['view_state_dashboard', 'manage_redistribution'],
  super_admin: [
    'view_citizen_dashboard',
    'view_asha_dashboard',
    'view_doctor_dashboard',
    'view_nurse_dashboard',
    'view_hospital_dashboard',
    'view_pharmacy_dashboard',
    'view_laboratory_dashboard',
    'view_district_dashboard',
    'view_state_dashboard',
    'view_admin_dashboard',
    'manage_users',
    'manage_redistribution',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getHomeRouteForRole(role: UserRole): string {
  switch (role) {
    case 'citizen':
      return ROUTES.DASHBOARD.CITIZEN.HOME;
    case 'asha_worker':
      return ROUTES.DASHBOARD.ASHA.HOME;
    case 'doctor':
      return ROUTES.DASHBOARD.DOCTOR.HOME;
    case 'nurse':
      return ROUTES.DASHBOARD.NURSE.HOME;
    case 'hospital_admin':
      return ROUTES.DASHBOARD.HOSPITAL.HOME;
    case 'pharmacist':
      return ROUTES.DASHBOARD.PHARMACY.HOME;
    case 'lab_technician':
      return ROUTES.DASHBOARD.LABORATORY.HOME;
    case 'district_admin':
      return ROUTES.DASHBOARD.DISTRICT.HOME;
    case 'state_admin':
      return ROUTES.DASHBOARD.STATE.HOME;
    case 'super_admin':
      return ROUTES.DASHBOARD.ADMIN.HOME;
    default:
      return ROUTES.PUBLIC.UNAUTHORIZED;
  }
}
