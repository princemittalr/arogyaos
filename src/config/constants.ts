export const APP_CONFIG = {
  name: 'ArogyaOS',
  tagline: 'AI-Powered Unified Healthcare Operating System',
  supportEmail: 'support@arogyaos.in',
  sessionCookieName: 'arogyaos_session',
  sessionMaxAge: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;

export const DB_COLLECTIONS = {
  USERS: 'users',
  PATIENT_PROFILES: 'patient_profiles',
  DOCTOR_PROFILES: 'doctor_profiles',
  HOSPITAL_PROFILES: 'hospital_profiles',
  DISTRICT_PROFILES: 'district_profiles',
  APPOINTMENTS: 'appointments',
  PRESCRIPTIONS: 'prescriptions',
  INVENTORY: 'inventory',
  AI_PREDICTIONS: 'ai_predictions',
  NOTIFICATIONS: 'notifications',
  ATTENDANCE: 'attendance',
} as const;

export const CACHE_KEYS = {
  AUTH_USER: 'auth_user',
  PATIENT_PROFILE: 'patient_profile',
  DOCTOR_PROFILE: 'doctor_profile',
  HOSPITAL_PROFILE: 'hospital_profile',
  DISTRICT_PROFILE: 'district_profile',
  APPOINTMENTS: 'appointments',
  PRESCRIPTIONS: 'prescriptions',
  INVENTORY: 'inventory',
} as const;
