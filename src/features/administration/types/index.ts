export type RoleType = 'SuperAdmin' | 'TenantAdmin' | 'HospitalAdmin' | 'DepartmentAdmin' | 'ClinicAdmin' | 'Doctor' | 'Nurse' | 'Pharmacist' | 'Technician' | 'Patient' | 'System';
export type PermissionType = 'Read' | 'Write' | 'Delete' | 'Manage' | 'Execute';
export type OrganizationType = 'Government' | 'Private' | 'NonProfit' | 'Enterprise';
export type FacilityType = 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy' | 'ResearchCenter';
export type SessionStatus = 'Active' | 'Inactive' | 'Expired' | 'Revoked' | 'Locked';
export type MFAType = 'TOTP' | 'SMS' | 'Email' | 'HardwareKey' | 'Biometric';
export type SSOType = 'SAML' | 'OIDC' | 'OAuth2' | 'Custom';
export type FeatureFlagState = 'Enabled' | 'Disabled' | 'Beta' | 'Deprecated';
export type ModuleState = 'Active' | 'Inactive' | 'Maintenance' | 'Trial' | 'Expired';
export type LicenseType = 'Enterprise' | 'Professional' | 'Standard' | 'Trial' | 'OpenSource';
export type SubscriptionType = 'Monthly' | 'Annual' | 'Perpetual' | 'UsageBased';
export type SecurityLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'MilitaryGrade';
export type RetentionPolicy = '30Days' | '90Days' | '1Year' | '7Years' | 'Indefinite';
export type SystemHealthState = 'Healthy' | 'Degraded' | 'Critical' | 'Maintenance' | 'Offline';

export interface UserPreferences {
  theme: 'Light' | 'Dark' | 'System';
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface User {
  id: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'PendingApproval';
  profile: UserProfile;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Permission {
  id: string;
  name: string;
  type: PermissionType;
  resource: string;
  description: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  permissions: string[];
  description: string;
  isSystem: boolean;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  scopeId: string;
  scopeType: 'System' | 'Tenant' | 'Organization' | 'Facility' | 'Department';
  assignedAt: string;
  assignedBy: string;
}

export interface AccessRule {
  resource: string;
  action: PermissionType;
  effect: 'Allow' | 'Deny';
  conditions?: Record<string, unknown>;
}

export interface AccessPolicy {
  id: string;
  name: string;
  rules: AccessRule[];
}

export interface SessionDevice {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  os?: string;
  browser?: string;
}

export interface SessionActivity {
  action: string;
  timestamp: string;
  resource?: string;
}

export interface Session {
  id: string;
  userId: string;
  status: SessionStatus;
  device: SessionDevice;
  startedAt: string;
  expiresAt: string;
  lastActivityAt: string;
  activities: SessionActivity[];
}

export interface MFAMethod {
  id: string;
  userId: string;
  type: MFAType;
  isPrimary: boolean;
  status: 'Active' | 'PendingValidation' | 'Revoked';
  addedAt: string;
}

export interface MFAChallenge {
  id: string;
  methodId: string;
  status: 'Pending' | 'Passed' | 'Failed' | 'Expired';
  issuedAt: string;
  expiresAt: string;
}

export interface SSOProvider {
  id: string;
  name: string;
  type: SSOType;
  tenantId: string;
  configuration: Record<string, unknown>;
  isActive: boolean;
}

export interface APIKeyScope {
  resource: string;
  actions: PermissionType[];
}

export interface APIKey {
  id: string;
  serviceAccountId: string;
  name: string;
  scopes: APIKeyScope[];
  status: 'Active' | 'Revoked' | 'Expired';
  createdAt: string;
  expiresAt?: string;
}

export interface ServiceAccount {
  id: string;
  name: string;
  tenantId: string;
  roleId: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  tenantId: string;
  contactEmail: string;
  status: 'Active' | 'Inactive';
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
}

export interface District {
  id: string;
  name: string;
  stateCode: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  organizationId: string;
  districtId: string;
  address: string;
}

export interface Hospital extends Facility {
  bedCount: number;
  level: string;
}

export interface Clinic extends Facility {
  specialty: string;
}

export interface Department {
  id: string;
  name: string;
  facilityId: string;
  headUserId?: string;
}

export interface BrandingConfiguration {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface LocalizationConfiguration {
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface LanguageConfiguration {
  code: string;
  name: string;
  direction: 'LTR' | 'RTL';
}

export interface TimezoneConfiguration {
  defaultTimezone: string;
  supportedTimezones: string[];
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  state: FeatureFlagState;
  description: string;
}

export interface FeatureToggle {
  flagId: string;
  scopeId: string;
  isEnabled: boolean;
}

export interface ModuleConfiguration {
  moduleId: string;
  name: string;
  state: ModuleState;
  version: string;
  dependencies: string[];
}

export interface SystemConfiguration {
  tenantId: string;
  branding: BrandingConfiguration;
  localization: LocalizationConfiguration;
  timezone: TimezoneConfiguration;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  expirationDays: number;
  historySize: number;
}

export interface SessionPolicy {
  idleTimeoutMinutes: number;
  absoluteTimeoutMinutes: number;
  maxConcurrentSessions: number;
}

export interface ConsentPolicy {
  id: string;
  name: string;
  version: string;
  content: string;
  isMandatory: boolean;
}

export interface AuditRetentionPolicy {
  resourceType: string;
  retentionPeriod: RetentionPolicy;
}

export interface SecurityPolicy {
  tenantId: string;
  level: SecurityLevel;
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  mfaRequired: boolean;
}

export interface BackupPolicy {
  id: string;
  name: string;
  frequencyMinutes: number;
  retentionDays: number;
}

export interface MaintenanceWindow {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  targetScope: string;
  publishedAt: string;
  expiresAt: string;
}

export interface License {
  id: string;
  type: LicenseType;
  tenantId: string;
  issuedAt: string;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Suspended';
}

export interface LicenseAllocation {
  licenseId: string;
  userId: string;
  assignedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionType;
  features: string[];
}

export interface UsageQuota {
  id: string;
  tenantId: string;
  resource: string;
  limit: number;
  period: 'Daily' | 'Monthly' | 'Yearly';
}

export interface UsageMetric {
  tenantId: string;
  resource: string;
  value: number;
  timestamp: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  status: 'Active' | 'Paused';
  lastRunAt?: string;
  nextRunAt: string;
}

export interface HealthCheck {
  component: string;
  status: SystemHealthState;
  lastCheckedAt: string;
  message?: string;
}

export interface SystemStatus {
  state: SystemHealthState;
  checks: HealthCheck[];
  timestamp: string;
}

export interface AdministrationAudit {
  id: string;
  action: string;
  actorId: string;
  targetId: string;
  targetType: string;
  timestamp: string;
  details: Record<string, unknown>;
}
