export const ROLE_TYPES = [
  'SuperAdmin',
  'TenantAdmin',
  'HospitalAdmin',
  'DepartmentAdmin',
  'ClinicAdmin',
  'Doctor',
  'Nurse',
  'Pharmacist',
  'Technician',
  'Patient',
  'System'
] as const;

export const PERMISSION_TYPES = [
  'Read',
  'Write',
  'Delete',
  'Manage',
  'Execute'
] as const;

export const ORGANIZATION_TYPES = [
  'Government',
  'Private',
  'NonProfit',
  'Enterprise'
] as const;

export const FACILITY_TYPES = [
  'Hospital',
  'Clinic',
  'Laboratory',
  'Pharmacy',
  'ResearchCenter'
] as const;

export const SESSION_STATUSES = [
  'Active',
  'Inactive',
  'Expired',
  'Revoked',
  'Locked'
] as const;

export const MFA_TYPES = [
  'TOTP',
  'SMS',
  'Email',
  'HardwareKey',
  'Biometric'
] as const;

export const SSO_TYPES = [
  'SAML',
  'OIDC',
  'OAuth2',
  'Custom'
] as const;

export const FEATURE_FLAG_STATES = [
  'Enabled',
  'Disabled',
  'Beta',
  'Deprecated'
] as const;

export const MODULE_STATES = [
  'Active',
  'Inactive',
  'Maintenance',
  'Trial',
  'Expired'
] as const;

export const LICENSE_TYPES = [
  'Enterprise',
  'Professional',
  'Standard',
  'Trial',
  'OpenSource'
] as const;

export const SUBSCRIPTION_TYPES = [
  'Monthly',
  'Annual',
  'Perpetual',
  'UsageBased'
] as const;

export const SECURITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical',
  'MilitaryGrade'
] as const;

export const RETENTION_POLICIES = [
  '30Days',
  '90Days',
  '1Year',
  '7Years',
  'Indefinite'
] as const;

export const SUPPORTED_LOCALES = [
  'en-US',
  'en-GB',
  'hi-IN',
  'es-ES',
  'fr-FR'
] as const;

export const SUPPORTED_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'Europe/London'
] as const;

export const SYSTEM_HEALTH_STATES = [
  'Healthy',
  'Degraded',
  'Critical',
  'Maintenance',
  'Offline'
] as const;
