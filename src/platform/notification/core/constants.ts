export const NOTIFICATION_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
  'CRITICAL'
] as const;

export const NOTIFICATION_CHANNELS = [
  'EMAIL',
  'SMS',
  'PUSH',
  'WHATSAPP',
  'VOICE',
  'WEBHOOK',
  'IN_APP'
] as const;

export const DELIVERY_STATUSES = [
  'PENDING',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'FAILED',
  'READ',
  'DISMISSED'
] as const;

export const RETRY_BACKOFF_TYPES = [
  'LINEAR',
  'EXPONENTIAL'
] as const;

export const NOTIFICATION_CATEGORIES = [
  'SYSTEM',
  'SECURITY',
  'ALERT',
  'UPDATE',
  'REMINDER',
  'MARKETING'
] as const;

export const CAMPAIGN_STATUSES = [
  'DRAFT',
  'SCHEDULED',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
] as const;

export const ANNOUNCEMENT_TYPES = [
  'MAINTENANCE',
  'FEATURE_RELEASE',
  'POLICY_UPDATE',
  'EMERGENCY'
] as const;

export const TOPIC_TYPES = [
  'NEWSLETTER',
  'BILLING',
  'APPOINTMENTS',
  'TEST_RESULTS'
] as const;

export const COMMUNICATION_POLICIES = [
  'STRICT',
  'RELAXED',
  'CRITICAL_ONLY'
] as const;

export const DEFAULT_PREFERENCES = {
  optedInChannels: ['IN_APP', 'EMAIL'],
  optedOutCategories: ['MARKETING'],
  quietHoursEnabled: false
};
