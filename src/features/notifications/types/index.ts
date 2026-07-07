export type NotificationChannel = 'In-App' | 'Push' | 'Email' | 'SMS' | 'WhatsApp' | 'Voice Call' | 'Webhook';
export type NotificationCategory = 'Clinical' | 'Appointment' | 'Medication' | 'Prescription' | 'Laboratory' | 'Radiology' | 'Vaccination' | 'Pharmacy' | 'Health Vault' | 'Billing' | 'Insurance' | 'Emergency' | 'System';
export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Urgent' | 'Critical';
export type NotificationStatus = 'Draft' | 'Queued' | 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Cancelled';

export interface NotificationAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface NotificationRecipient {
  id: string;
  type: 'Patient' | 'Provider' | 'Staff' | 'System';
  channels: NotificationChannel[];
  contactInfo: Record<string, string>;
}

export interface NotificationDelivery {
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  error?: string;
  providerId?: string;
}

export interface NotificationSchedule {
  scheduledFor: string;
  timezone: string;
  recurrence?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  recipients: NotificationRecipient[];
  channels: NotificationChannel[];
  deliveries: Record<string, NotificationDelivery[]>;
  status: NotificationStatus;
  schedule?: NotificationSchedule;
  attachments?: NotificationAttachment[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  content: Record<string, { subject?: string; body: string }>;
  variables: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  userType: 'Patient' | 'Provider' | 'Staff';
  channels: Record<NotificationCategory, NotificationChannel[]>;
  quietHours?: { start: string; end: string; timezone: string };
  optOut: boolean;
  updatedAt: string;
}

export interface ReminderRule {
  interval: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
  beforeEvent: boolean;
}

export interface ReminderOccurrence {
  id: string;
  scheduledTime: string;
  status: NotificationStatus;
  deliveryId?: string;
}

export interface Reminder {
  id: string;
  referenceId: string;
  referenceType: 'Appointment' | 'Medication' | 'Vaccination' | 'Other';
  rules: ReminderRule[];
  occurrences: ReminderOccurrence[];
  recipients: NotificationRecipient[];
  templateId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  body: string;
  targetAudience: Record<string, unknown>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: NotificationPriority;
  validFrom: string;
  validTo?: string;
  targetRoles: string[];
  isDismissible: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  clickThroughRate?: number;
  deliveryRate: number;
  lastCalculatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  purpose: string;
  templateId: string;
  audienceFilter: Record<string, unknown>;
  schedule: NotificationSchedule;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  metrics: NotificationMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  notificationId?: string;
  recipientId: string;
  channel: NotificationChannel;
  direction: 'Inbound' | 'Outbound';
  contentSummary: string;
  status: NotificationStatus;
  timestamp: string;
  metadata: Record<string, unknown>;
}
