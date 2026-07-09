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
    ASHA: {
      HOME: '/dashboard/asha',
    },
    DOCTOR: {
      HOME: '/dashboard/doctor',
      PATIENTS: '/dashboard/doctor/patients',
      CONSULTATION: (id: string) => `/dashboard/doctor/consultation/${id}`,
      CALENDAR: '/dashboard/doctor/calendar',
    },
    NURSE: {
      HOME: '/dashboard/nurse',
      PATIENTS: '/dashboard/nurse/patients',
      WARD: '/dashboard/nurse/ward',
      BEDS: '/dashboard/nurse/beds',
      VITALS: '/dashboard/nurse/vitals',
      MEDICATIONS: '/dashboard/nurse/medications',
      NOTES: '/dashboard/nurse/notes',
      EMERGENCY: '/dashboard/nurse/emergency',
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
      ORDERS: '/dashboard/laboratory/orders',
      SAMPLES: '/dashboard/laboratory/samples',
      PROCESSING: '/dashboard/laboratory/processing',
      RESULTS: '/dashboard/laboratory/results',
      REPORTS: '/dashboard/laboratory/reports',
      QC: '/dashboard/laboratory/qc',
      EQUIPMENT: '/dashboard/laboratory/equipment',
      INVENTORY: '/dashboard/laboratory/inventory',
      PATIENTS: '/dashboard/laboratory/patients',
      ANALYTICS: '/dashboard/laboratory/analytics',
      SYNC: '/dashboard/laboratory/sync',
      PROFILE: '/dashboard/laboratory/profile',
      SETTINGS: '/dashboard/laboratory/settings',
    },
    DISTRICT: {
      HOME: '/dashboard/district',
      REDISTRIBUTION: '/dashboard/district/redistribution',
    },
    STATE: {
      HOME: '/dashboard/state',
    },
    ADMIN: {
      HOME: '/dashboard/admin',
    },
  },
} as const;

export type RoutesType = typeof ROUTES;
