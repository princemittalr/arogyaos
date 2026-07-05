import { UserRole } from './roles';
import { ROUTES } from './routes';

export type Permission =
  | 'view_citizen_dashboard'
  | 'view_doctor_dashboard'
  | 'view_hospital_dashboard'
  | 'view_pharmacy_dashboard'
  | 'view_laboratory_dashboard'
  | 'view_district_dashboard'
  | 'manage_users'
  | 'manage_redistribution';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  citizen: ['view_citizen_dashboard'],
  doctor: ['view_doctor_dashboard'],
  nurse: ['view_hospital_dashboard'],
  pharmacist: ['view_pharmacy_dashboard'],
  lab_technician: ['view_laboratory_dashboard'],
  hospital_admin: ['view_hospital_dashboard'],
  district_admin: ['view_district_dashboard', 'manage_redistribution'],
  super_admin: [
    'view_citizen_dashboard',
    'view_doctor_dashboard',
    'view_hospital_dashboard',
    'view_pharmacy_dashboard',
    'view_laboratory_dashboard',
    'view_district_dashboard',
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
    case 'doctor':
      return ROUTES.DASHBOARD.DOCTOR.HOME;
    case 'hospital_admin':
    case 'nurse':
      return ROUTES.DASHBOARD.HOSPITAL.HOME;
    case 'pharmacist':
      return ROUTES.DASHBOARD.PHARMACY.HOME;
    case 'lab_technician':
      return ROUTES.DASHBOARD.LABORATORY.HOME;
    case 'district_admin':
      return ROUTES.DASHBOARD.DISTRICT.HOME;
    case 'super_admin':
      return ROUTES.DASHBOARD.HOME;
    default:
      return ROUTES.PUBLIC.UNAUTHORIZED;
  }
}
