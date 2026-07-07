import type { BaseVaultRecord } from '@/features/health-vault/types';
import type {
  AppointmentStatus, AppointmentPriority, AppointmentType,
  AppointmentSource, ReminderType,
} from '../core/constants';

export interface AppointmentParticipant {
  participantId: string;
  userId: string;
  name: string;
  role: string;
  type: 'patient' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'technician' | 'other';
  contactEmail?: string;
  contactPhone?: string;
  department?: string;
  organization?: string;
}

export interface AppointmentSlot {
  slotId: string;
  facilityId: string;
  providerId: string;
  providerName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAvailable: boolean;
  type?: AppointmentType;
  reasonBlocked?: string;
}

export interface AppointmentAvailability {
  availabilityId: string;
  providerId: string;
  providerName: string;
  facilityId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  isAvailable: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  reasonUnavailable?: string;
}

export interface AppointmentSchedule {
  scheduleId: string;
  providerId: string;
  providerName: string;
  facilityId: string;
  date: string;
  slots: AppointmentSlot[];
  isActive: boolean;
  notes?: string;
}

export interface AppointmentReminder {
  reminderId: string;
  appointmentId: string;
  type: ReminderType;
  recipientId: string;
  recipientContact: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

export interface AppointmentLocation {
  building?: string;
  floor?: string;
  room?: string;
  wing?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  type: 'physical' | 'telemedicine' | 'home_visit';
  telemedicineUrl?: string;
  instructions?: string;
}

export interface FollowUpAppointment {
  followUpId: string;
  originalAppointmentId: string;
  patientId: string;
  recommendedDate: string;
  recommendedBy: string;
  reason: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduledAppointmentId?: string;
  notes?: string;
}

export interface AppointmentCancellation {
  cancelledAt: string;
  cancelledBy: string;
  cancelledByRole: string;
  reason: string;
  reasonCode?: string;
  isOnTime: boolean;
  refundAmount?: number;
  penaltyAmount?: number;
  notes?: string;
}

export interface AppointmentRescheduleRequest {
  requestId: string;
  appointmentId: string;
  requestedBy: string;
  requestedByRole: string;
  requestedAt: string;
  originalDate: string;
  originalStartTime: string;
  proposedDate: string;
  proposedStartTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rescheduleCount: number;
}

export interface CalendarEvent {
  eventId: string;
  appointmentId: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  type: AppointmentType;
  status: AppointmentStatus;
  providerId?: string;
  providerName?: string;
  patientId?: string;
  patientName?: string;
  facilityId?: string;
  facilityName?: string;
  location?: AppointmentLocation;
  color?: string;
  isEditable: boolean;
  metadata?: Record<string, unknown>;
}

export interface WaitingListEntry {
  entryId: string;
  patientId: string;
  patientName: string;
  patientContact?: string;
  requestedType: AppointmentType;
  requestedDate: string;
  preferredTime?: string;
  preferredProviderId?: string;
  priority: AppointmentPriority;
  status: 'waiting' | 'notified' | 'scheduled' | 'expired' | 'cancelled';
  createdAt: string;
  notes?: string;
  notifiedAt?: string;
  notifiedBy?: string;
  scheduledAppointmentId?: string;
  expiryDate?: string;
}

export interface Appointment extends BaseVaultRecord {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientContact?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  source: AppointmentSource;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  providerId: string;
  providerName: string;
  facilityId: string;
  facilityName: string;
  department?: string;
  participants: AppointmentParticipant[];
  location: AppointmentLocation;
  reason?: string;
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  cancellation?: AppointmentCancellation;
  rescheduledFrom?: {
    previousDate: string;
    previousStartTime: string;
    rescheduleCount: number;
  };
  followUp?: FollowUpAppointment;
  reminders?: AppointmentReminder[];
  referralId?: string;
  referralSource?: string;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    authorizationNumber?: string;
  };
  checkInTime?: string;
  checkInBy?: string;
  startTimeActual?: string;
  endTimeActual?: string;
  noShowNotified?: boolean;
  tags?: string[];
}
