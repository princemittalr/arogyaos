import { UserRole } from './roles';
import { ROUTES } from './routes';

export interface NavItem {
  title: string;
  href: string;
  icon: string; // Lucide icon identifier string
}

export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  citizen: [
    { title: 'Overview', href: ROUTES.DASHBOARD.CITIZEN.HOME, icon: 'Home' },
    { title: 'My Appointments', href: ROUTES.DASHBOARD.CITIZEN.APPOINTMENTS, icon: 'Calendar' },
    { title: 'Prescriptions', href: ROUTES.DASHBOARD.CITIZEN.PRESCRIPTIONS, icon: 'FileText' },
    { title: 'Family Members', href: ROUTES.DASHBOARD.CITIZEN.PROFILES, icon: 'Users' },
  ],
  doctor: [
    { title: 'Queue', href: ROUTES.DASHBOARD.DOCTOR.HOME, icon: 'ClipboardList' },
    { title: 'Patients', href: ROUTES.DASHBOARD.DOCTOR.PATIENTS, icon: 'UserSquare2' },
    { title: 'Schedule', href: ROUTES.DASHBOARD.DOCTOR.CALENDAR, icon: 'Calendar' },
  ],
  hospital_admin: [
    { title: 'Overview', href: '/dashboard/hospital', icon: 'LayoutDashboard' },
    { title: 'Departments', href: '/dashboard/hospital/departments', icon: 'Building' },
    { title: 'Doctors', href: '/dashboard/hospital/doctors', icon: 'UserSquare2' },
    { title: 'Staff Directory', href: '/dashboard/hospital/staff', icon: 'Contact' },
    { title: 'Patients', href: '/dashboard/hospital/patients', icon: 'Users' },
    { title: 'Appointments', href: '/dashboard/hospital/appointments', icon: 'Calendar' },
    { title: 'Pharmacy', href: '/dashboard/hospital/pharmacy', icon: 'FileText' },
    { title: 'Laboratory', href: '/dashboard/hospital/laboratory', icon: 'Activity' },
    { title: 'Inventory', href: '/dashboard/hospital/inventory', icon: 'Package' },
    { title: 'Rooms', href: '/dashboard/hospital/rooms', icon: 'Home' },
    { title: 'Beds', href: '/dashboard/hospital/beds', icon: 'Bed' },
    { title: 'Analytics Reports', href: '/dashboard/hospital/reports', icon: 'FileText' },
    { title: 'Settings', href: '/dashboard/hospital/settings', icon: 'Settings' },
  ],
  nurse: [
    { title: 'Overview', href: ROUTES.DASHBOARD.HOSPITAL.HOME, icon: 'LayoutDashboard' },
    { title: 'Bed Allocations', href: ROUTES.DASHBOARD.HOSPITAL.BEDS, icon: 'Bed' },
  ],
  pharmacist: [
    { title: 'Overview', href: ROUTES.DASHBOARD.PHARMACY.HOME, icon: 'Home' },
    { title: 'Inventory Levels', href: ROUTES.DASHBOARD.PHARMACY.INVENTORY, icon: 'Package' },
    { title: 'Dispense Medicine', href: ROUTES.DASHBOARD.PHARMACY.DISPENSE, icon: 'FileSearch2' },
  ],
  lab_technician: [
    { title: 'Overview', href: ROUTES.DASHBOARD.LABORATORY.HOME, icon: 'Home' },
    { title: 'Test Catalog', href: ROUTES.DASHBOARD.LABORATORY.TESTS, icon: 'Activity' },
    { title: 'Report Manager', href: ROUTES.DASHBOARD.LABORATORY.REPORTS, icon: 'UploadCloud' },
  ],
  district_admin: [
    { title: 'Overview', href: ROUTES.DASHBOARD.DISTRICT.HOME, icon: 'LayoutDashboard' },
    { title: 'Facility Map', href: ROUTES.DASHBOARD.DISTRICT.MONITORING, icon: 'Map' },
    { title: 'Redistribute Stock', href: ROUTES.DASHBOARD.DISTRICT.REDISTRIBUTION, icon: 'ArrowLeftRight' },
  ],
  super_admin: [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.HOME, icon: 'Shield' },
  ],
};

export function getNavigationForRole(role: UserRole): NavItem[] {
  return ROLE_NAVIGATION[role] || [];
}
