export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
  EXPIRED: 'EXPIRED',
} as const;
export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_PRIORITY = {
  ROUTINE: 'ROUTINE',
  URGENT: 'URGENT',
  EMERGENCY: 'EMERGENCY',
  CRITICAL: 'CRITICAL',
} as const;
export type AppointmentPriority = typeof APPOINTMENT_PRIORITY[keyof typeof APPOINTMENT_PRIORITY];

export const APPOINTMENT_TYPE = {
  GENERAL_CONSULTATION: 'GENERAL_CONSULTATION',
  SPECIALIST_CONSULTATION: 'SPECIALIST_CONSULTATION',
  TELEMEDICINE: 'TELEMEDICINE',
  FOLLOW_UP: 'FOLLOW_UP',
  EMERGENCY: 'EMERGENCY',
  VACCINATION: 'VACCINATION',
  LABORATORY: 'LABORATORY',
  RADIOLOGY: 'RADIOLOGY',
  PHARMACY_CONSULTATION: 'PHARMACY_CONSULTATION',
  HEALTH_CHECKUP: 'HEALTH_CHECKUP',
  HOME_VISIT: 'HOME_VISIT',
} as const;
export type AppointmentType = typeof APPOINTMENT_TYPE[keyof typeof APPOINTMENT_TYPE];

export const APPOINTMENT_SOURCE = {
  CITIZEN_PORTAL: 'CITIZEN_PORTAL',
  HOSPITAL: 'HOSPITAL',
  DOCTOR: 'DOCTOR',
  LABORATORY: 'LABORATORY',
  RADIOLOGY: 'RADIOLOGY',
  PHARMACY: 'PHARMACY',
  REFERRAL: 'REFERRAL',
  SYSTEM_GENERATED: 'SYSTEM_GENERATED',
} as const;
export type AppointmentSource = typeof APPOINTMENT_SOURCE[keyof typeof APPOINTMENT_SOURCE];

export const REMINDER_TYPE = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  WHATSAPP: 'WHATSAPP',
  PHONE: 'PHONE',
} as const;
export type ReminderType = typeof REMINDER_TYPE[keyof typeof REMINDER_TYPE];

export const CALENDAR_VIEW = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  AGENDA: 'AGENDA',
} as const;
export type CalendarView = typeof CALENDAR_VIEW[keyof typeof CALENDAR_VIEW];

export const DEFAULT_WORKING_HOURS = {
  START: '09:00',
  END: '17:00',
} as const;

export const DEFAULT_SLOT_DURATION_MINUTES = 30;

export const BOOKING_CONSTRAINTS = {
  MAX_ADVANCE_DAYS: 90,
  MIN_NOTICE_HOURS: 1,
  MAX_PER_DAY: 5,
  CANCELLATION_WINDOW_HOURS: 24,
  RESCHEDULE_LIMIT: 3,
  MAX_SLOTS_PER_PROVIDER_PER_DAY: 20,
  OVERBOOKING_LIMIT: 2,
} as const;

export const SUPPORTED_FILTERS = [
  'status',
  'priority',
  'type',
  'source',
  'providerId',
  'facilityId',
  'department',
  'dateRange',
  'patientId',
] as const;
export type SupportedFilter = typeof SUPPORTED_FILTERS[number];

export const SEARCH_FIELDS = [
  'patientName',
  'providerName',
  'facilityName',
  'reason',
  'notes',
  'patientContact',
] as const;
export type SearchField = typeof SEARCH_FIELDS[number];
