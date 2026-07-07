// ─── Vaccination Status ──────────────────────────────────────────────

export const VACCINATION_STATUS = {
  SCHEDULED: 'SCHEDULED',
  DUE: 'DUE',
  ADMINISTERED: 'ADMINISTERED',
  VERIFIED: 'VERIFIED',
  DELAYED: 'DELAYED',
  MISSED: 'MISSED',
  CANCELLED: 'CANCELLED',
  REFUSED: 'REFUSED',
  EXPIRED: 'EXPIRED',
} as const;

export type VaccinationStatus = typeof VACCINATION_STATUS[keyof typeof VACCINATION_STATUS];

// ─── Vaccine Categories ──────────────────────────────────────────────

export const VACCINATION_CATEGORY = {
  CHILDHOOD: 'CHILDHOOD',
  ADULT: 'ADULT',
  PREGNANCY: 'PREGNANCY',
  OCCUPATIONAL: 'OCCUPATIONAL',
  TRAVEL: 'TRAVEL',
  BOOSTER: 'BOOSTER',
  COVID: 'COVID',
  INFLUENZA: 'INFLUENZA',
  HEPATITIS: 'HEPATITIS',
  HPV: 'HPV',
} as const;

export type VaccinationCategory = typeof VACCINATION_CATEGORY[keyof typeof VACCINATION_CATEGORY];

// ─── Administration Routes ───────────────────────────────────────────

export const ADMINISTRATION_ROUTES = {
  INTRAMUSCULAR: 'INTRAMUSCULAR',
  SUBCUTANEOUS: 'SUBCUTANEOUS',
  INTRADERMAL: 'INTRADERMAL',
  ORAL: 'ORAL',
  INTRANASAL: 'INTRANASAL',
} as const;

export type AdministrationRoute = typeof ADMINISTRATION_ROUTES[keyof typeof ADMINISTRATION_ROUTES];

// ─── Administration Sites ────────────────────────────────────────────

export const ADMINISTRATION_SITES = {
  LEFT_DELTOID: 'LEFT_DELTOID',
  RIGHT_DELTOID: 'RIGHT_DELTOID',
  LEFT_THIGH: 'LEFT_THIGH',
  RIGHT_THIGH: 'RIGHT_THIGH',
  LEFT_GLUTEAL: 'LEFT_GLUTEAL',
  RIGHT_GLUTEAL: 'RIGHT_GLUTEAL',
  ORAL_CAVITY: 'ORAL_CAVITY',
  LEFT_NARIS: 'LEFT_NARIS',
  RIGHT_NARIS: 'RIGHT_NARIS',
} as const;

export type AdministrationSite = typeof ADMINISTRATION_SITES[keyof typeof ADMINISTRATION_SITES];

// ─── Certificate Types ──────────────────────────────────────────────

export const CERTIFICATE_TYPES = {
  IMMUNIZATION_CERTIFICATE: 'IMMUNIZATION_CERTIFICATE',
  TRAVEL_VACCINATION_CERTIFICATE: 'TRAVEL_VACCINATION_CERTIFICATE',
  COVID_VACCINATION_CERTIFICATE: 'COVID_VACCINATION_CERTIFICATE',
  OCCUPATIONAL_VACCINATION_CERTIFICATE: 'OCCUPATIONAL_VACCINATION_CERTIFICATE',
} as const;

export type CertificateType = typeof CERTIFICATE_TYPES[keyof typeof CERTIFICATE_TYPES];

// ─── Severity Levels ─────────────────────────────────────────────────

export const SEVERITY_LEVELS = {
  MILD: 'MILD',
  MODERATE: 'MODERATE',
  SEVERE: 'SEVERE',
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

// ─── Timeline Event Names ────────────────────────────────────────────

export const TIMELINE_EVENT_NAMES = {
  VACCINATION_SCHEDULED: 'VACCINATION_SCHEDULED',
  VACCINATION_ADMINISTERED: 'VACCINATION_ADMINISTERED',
  VACCINATION_VERIFIED: 'VACCINATION_VERIFIED',
  BOOSTER_DUE: 'BOOSTER_DUE',
  CERTIFICATE_GENERATED: 'CERTIFICATE_GENERATED',
  ADVERSE_EVENT_RECORDED: 'ADVERSE_EVENT_RECORDED',
  VACCINATION_ARCHIVED: 'VACCINATION_ARCHIVED',
  VACCINATION_RESTORED: 'VACCINATION_RESTORED',
} as const;

export type TimelineEventName = typeof TIMELINE_EVENT_NAMES[keyof typeof TIMELINE_EVENT_NAMES];

// ─── Default Configuration ───────────────────────────────────────────

export const DEFAULT_CONFIG = {
  REMINDER_DAYS_BEFORE_DUE: 7,
  OVERDUE_GRACE_PERIOD_DAYS: 30,
  CERTIFICATE_EXPIRY_YEARS: 10,
  MAX_DOSE_NUMBER: 10,
  MIN_SCHEDULE_INTERVAL_DAYS: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ─── Supported Filters ───────────────────────────────────────────────

export const SUPPORTED_FILTERS = [
  'status',
  'category',
  'dateRange',
  'facility',
  'manufacturer',
  'batchNumber',
  'administeredBy',
] as const;

export type SupportedFilter = typeof SUPPORTED_FILTERS[number];

// ─── Search Fields ───────────────────────────────────────────────────

export const SEARCH_FIELDS = [
  'vaccineName',
  'diseaseTargeted',
  'batchNumber',
  'manufacturer',
  'facilityName',
  'patientName',
  'administeredBy',
] as const;

export type SearchField = typeof SEARCH_FIELDS[number];
