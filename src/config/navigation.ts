import { UserRole } from './roles';
import { ROUTES } from './routes';

export interface NavItem {
  title: string;
  href: string;
  icon: string; // Lucide icon identifier string
}

export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  citizen: [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.CITIZEN.HOME, icon: 'Home' },
    { title: 'Appointments', href: ROUTES.DASHBOARD.CITIZEN.APPOINTMENTS, icon: 'Calendar' },
    { title: 'Doctors', href: '/dashboard/citizen/doctors', icon: 'Stethoscope' },
    { title: 'Hospitals', href: '/dashboard/citizen/hospitals', icon: 'Building2' },
    { title: 'Prescriptions', href: ROUTES.DASHBOARD.CITIZEN.PRESCRIPTIONS, icon: 'FileText' },
    { title: 'Reports', href: '/dashboard/citizen/reports', icon: 'BarChart2' },
    { title: 'Family Members', href: ROUTES.DASHBOARD.CITIZEN.FAMILY, icon: 'Users' },
    { title: 'Notifications', href: '/dashboard/citizen/notifications', icon: 'Bell' },
    { title: 'Profile', href: '/dashboard/citizen/profile', icon: 'UserCircle' },
    { title: 'Settings', href: '/dashboard/citizen/settings', icon: 'Settings' },
  ],
  doctor: [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.DOCTOR.HOME, icon: 'LayoutDashboard' },
    { title: 'Appointments', href: '/dashboard/doctor/calendar', icon: 'Calendar' },
    { title: 'Patients', href: ROUTES.DASHBOARD.DOCTOR.PATIENTS, icon: 'UserSquare2' },
    { title: 'Consultations', href: '/dashboard/doctor/patients', icon: 'Stethoscope' },
    { title: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: 'FileText' },
    { title: 'Lab Orders', href: '/dashboard/doctor/lab-orders', icon: 'FlaskConical' },
    { title: 'Follow Ups', href: '/dashboard/doctor/follow-ups', icon: 'RefreshCw' },
    { title: 'AI Assistant', href: '/dashboard/doctor/ai-summary', icon: 'Bot' },
    { title: 'Profile', href: '/dashboard/doctor/profile', icon: 'UserCircle' },
    { title: 'Settings', href: '/dashboard/doctor/settings', icon: 'Settings' },
  ],
  hospital_admin: [
    { title: 'Dashboard', href: '/dashboard/hospital', icon: 'LayoutDashboard' },
    { title: 'Patients', href: '/dashboard/hospital/patients', icon: 'Users' },
    { title: 'Doctors', href: '/dashboard/hospital/doctors', icon: 'UserSquare2' },
    { title: 'Appointments', href: '/dashboard/hospital/appointments', icon: 'Calendar' },
    { title: 'Departments', href: '/dashboard/hospital/departments', icon: 'Building' },
    { title: 'Beds', href: '/dashboard/hospital/beds', icon: 'Bed' },
    { title: 'Rooms', href: '/dashboard/hospital/rooms', icon: 'Home' },
    { title: 'Inventory', href: '/dashboard/hospital/inventory', icon: 'Package' },
    { title: 'Pharmacy', href: '/dashboard/hospital/pharmacy', icon: 'Pill' },
    { title: 'Laboratory', href: '/dashboard/hospital/laboratory', icon: 'FlaskConical' },
    { title: 'Reports', href: '/dashboard/hospital/reports', icon: 'BarChart2' },
    { title: 'AI Insights', href: '/dashboard/hospital/ai-health-score', icon: 'Bot' },
    { title: 'Profile', href: '/dashboard/hospital/settings', icon: 'Settings' },
  ],
  nurse: [
    { title: 'Overview', href: ROUTES.DASHBOARD.HOSPITAL.HOME, icon: 'LayoutDashboard' },
    { title: 'Bed Allocations', href: ROUTES.DASHBOARD.HOSPITAL.BEDS, icon: 'Bed' },
  ],
  pharmacist: [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.PHARMACY.HOME, icon: 'LayoutDashboard' },
    { title: 'Dispensing Queue', href: ROUTES.DASHBOARD.PHARMACY.DISPENSE, icon: 'FileSearch2' },
    { title: 'Inventory', href: ROUTES.DASHBOARD.PHARMACY.INVENTORY, icon: 'Package' },
    { title: 'Medicines', href: '/dashboard/pharmacy/medicines', icon: 'Pill' },
    { title: 'Expiry Tracker', href: '/dashboard/pharmacy/expiry', icon: 'AlertTriangle' },
    { title: 'Reports', href: '/dashboard/pharmacy/reports', icon: 'BarChart2' },
    { title: 'AI Forecast', href: '/dashboard/pharmacy/ai-forecast', icon: 'Bot' },
  ],
  lab_technician: [
    { title: 'Overview', href: ROUTES.DASHBOARD.LABORATORY.HOME, icon: 'Home' },
    { title: 'Test Catalog', href: ROUTES.DASHBOARD.LABORATORY.TESTS, icon: 'Activity' },
    { title: 'Report Manager', href: ROUTES.DASHBOARD.LABORATORY.REPORTS, icon: 'UploadCloud' },
  ],
  district_admin: [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.DISTRICT.HOME, icon: 'LayoutDashboard' },
    { title: 'Hospitals', href: '/dashboard/district/hospitals', icon: 'Building2' },
    { title: 'PHCs', href: '/dashboard/district/phcs', icon: 'MapPin' },
    { title: 'CHCs', href: '/dashboard/district/chcs', icon: 'MapPin' },
    { title: 'Medicine Monitor', href: '/dashboard/district/medicine-monitoring', icon: 'Pill' },
    { title: 'Bed Monitor', href: '/dashboard/district/bed-monitoring', icon: 'Bed' },
    { title: 'Doctor Attendance', href: '/dashboard/district/doctor-attendance', icon: 'UserCheck' },
    { title: 'Critical Alerts', href: '/dashboard/district/alerts', icon: 'AlertTriangle' },
    { title: 'Redistribution', href: ROUTES.DASHBOARD.DISTRICT.REDISTRIBUTION, icon: 'ArrowLeftRight' },
    { title: 'AI Center', href: '/dashboard/district/ai', icon: 'Bot' },
    { title: 'Reports', href: '/dashboard/district/reports', icon: 'BarChart2' },
  ],
  super_admin: [
    { title: 'Dashboard', href: ROUTES.DASHBOARD.HOME, icon: 'Shield' },
  ],
};

export function getNavigationForRole(role: UserRole): NavItem[] {
  return ROLE_NAVIGATION[role] || [];
}
