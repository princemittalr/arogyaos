export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP' | 'VOICE' | 'WEBHOOK' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ' | 'DISMISSED';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type NotificationCategory = 'SYSTEM' | 'SECURITY' | 'ALERT' | 'UPDATE' | 'REMINDER' | 'MARKETING';

export interface NotificationRecipient {
  id: string;
  userId: string;
  contactData: Record<string, string>;
  preferencesId: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  variables: string[];
}

export interface Notification {
  id: string;
  templateId: string;
  recipientId: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  providerId: string;
  attempts: number;
  lastAttemptAt: string | null;
}

export interface EmailNotification extends NotificationDelivery {
  subject: string;
  htmlBody: string;
}

export interface SMSNotification extends NotificationDelivery {
  textBody: string;
}

export interface PushNotification extends NotificationDelivery {
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface WhatsAppNotification extends NotificationDelivery {
  templateName: string;
  templateLanguage: string;
}

export interface VoiceNotification extends NotificationDelivery {
  audioUrl: string;
}

export interface WebhookNotification extends NotificationDelivery {
  endpoint: string;
  payloadConfig: Record<string, unknown>;
}

export interface DeliveryReceipt {
  deliveryId: string;
  timestamp: string;
  status: NotificationStatus;
  providerResponse: Record<string, unknown>;
}

export interface DeliveryProvider {
  id: string;
  name: string;
  channel: NotificationChannel;
  priority: number;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  optedInChannels: NotificationChannel[];
  optedOutCategories: NotificationCategory[];
  quietHoursId: string | null;
}

export interface QuietHours {
  id: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface NotificationSchedule {
  id: string;
  notificationId: string;
  scheduledAt: string;
  recurrenceRule: string | null;
}

export interface NotificationRetryPolicy {
  id: string;
  maxAttempts: number;
  backoffType: 'LINEAR' | 'EXPONENTIAL';
  baseDelayMs: number;
}

export interface NotificationEscalation {
  id: string;
  originalDeliveryId: string;
  timeoutMs: number;
  escalationChannel: NotificationChannel;
}

export interface NotificationBatch {
  id: string;
  notifications: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface NotificationCampaign {
  id: string;
  name: string;
  templateId: string;
  targetAudienceConfig: Record<string, unknown>;
  scheduleId: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: NotificationPriority;
  targetRoles: string[];
}

export interface BroadcastMessage {
  id: string;
  announcementId: string;
  channels: NotificationChannel[];
}

export interface InboxMessage {
  id: string;
  notificationId: string;
  title: string;
  preview: string;
  isRead: boolean;
  isArchived: boolean;
}

export interface NotificationAuditEntry {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface CommunicationPolicy {
  id: string;
  name: string;
  maxMessagesPerDay: number;
  enforceQuietHours: boolean;
}

export interface CommunicationRule {
  id: string;
  policyId: string;
  condition: string;
  action: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface TopicSubscription {
  id: string;
  topicId: string;
  userId: string;
  channels: NotificationChannel[];
}

export interface Subscription {
  id: string;
  userId: string;
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
}

export interface UserNotificationSettings {
  id: string;
  userId: string;
  globalOptOut: boolean;
  preferences: NotificationPreference;
}

export interface NotificationConfiguration {
  id: string;
  version: string;
  defaultRetryPolicyId: string;
  globalPolicyId: string;
}
