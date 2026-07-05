export const ROUTES = {
  PUBLIC: {
    LANDING: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    UNAUTHORIZED: '/unauthorized',
  },
  DASHBOARD: {
    HOME: '/dashboard',
    CITIZEN: {
      HOME: '/dashboard/citizen',
      APPOINTMENTS: '/dashboard/citizen/appointments',
      PRESCRIPTIONS: '/dashboard/citizen/prescriptions',
      FAMILY: '/dashboard/citizen/family',
    },
    DOCTOR: {
      HOME: '/dashboard/doctor',
      PATIENTS: '/dashboard/doctor/patients',
      CONSULTATION: (id: string) => `/dashboard/doctor/consultation/${id}`,
      CALENDAR: '/dashboard/doctor/calendar',
    },
    HOSPITAL: {
      HOME: '/dashboard/hospital',
      DEPARTMENTS: '/dashboard/hospital/departments',
      STAFF: '/dashboard/hospital/staff',
      BEDS: '/dashboard/hospital/beds',
    },
    PHARMACY: {
      HOME: '/dashboard/pharmacy',
      INVENTORY: '/dashboard/pharmacy/inventory',
      DISPENSE: '/dashboard/pharmacy/dispense',
    },
    LABORATORY: {
      HOME: '/dashboard/laboratory',
      TESTS: '/dashboard/laboratory/tests',
      REPORTS: '/dashboard/laboratory/reports',
    },
    DISTRICT: {
      HOME: '/dashboard/district',
      MONITORING: '/dashboard/district/monitoring',
      REDISTRIBUTION: '/dashboard/district/redistribution',
    },
  },
} as const;

export type RoutesType = typeof ROUTES;
