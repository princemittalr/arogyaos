import { z } from 'zod';
import { VaultMetadataSchema } from '@/features/health-vault/utils/validations';
import {
  APPOINTMENT_STATUS, APPOINTMENT_PRIORITY, APPOINTMENT_TYPE,
  APPOINTMENT_SOURCE, REMINDER_TYPE,
} from '../core/constants';

export const AppointmentStatusSchema = z.nativeEnum(APPOINTMENT_STATUS);
export const AppointmentPrioritySchema = z.nativeEnum(APPOINTMENT_PRIORITY);
export const AppointmentTypeSchema = z.nativeEnum(APPOINTMENT_TYPE);
export const AppointmentSourceSchema = z.nativeEnum(APPOINTMENT_SOURCE);
export const ReminderTypeSchema = z.nativeEnum(REMINDER_TYPE);

export const AppointmentParticipantSchema = z.object({
  participantId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  type: z.enum(['patient', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'technician', 'other']),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  department: z.string().optional(),
  organization: z.string().optional(),
});

export const AppointmentLocationSchema = z.object({
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  wing: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  type: z.enum(['physical', 'telemedicine', 'home_visit']),
  telemedicineUrl: z.string().url().optional(),
  instructions: z.string().optional(),
});

export const AppointmentCancellationSchema = z.object({
  cancelledAt: z.string().min(1),
  cancelledBy: z.string().min(1),
  cancelledByRole: z.string().min(1),
  reason: z.string().min(1),
  reasonCode: z.string().optional(),
  isOnTime: z.boolean(),
  refundAmount: z.number().nonnegative().optional(),
  penaltyAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const FollowUpAppointmentSchema = z.object({
  followUpId: z.string().min(1),
  originalAppointmentId: z.string().min(1),
  patientId: z.string().min(1),
  recommendedDate: z.string().min(1),
  recommendedBy: z.string().min(1),
  reason: z.string().min(1),
  status: z.enum(['pending', 'scheduled', 'completed', 'cancelled']),
  scheduledAppointmentId: z.string().optional(),
  notes: z.string().optional(),
});

export const AppointmentReminderSchema = z.object({
  reminderId: z.string().min(1),
  appointmentId: z.string().min(1),
  type: ReminderTypeSchema,
  recipientId: z.string().min(1),
  recipientContact: z.string().min(1),
  scheduledAt: z.string().min(1),
  sentAt: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed', 'cancelled']),
  retryCount: z.number().int().nonnegative(),
  maxRetries: z.number().int().nonnegative(),
  lastError: z.string().optional(),
});

export const RescheduleSchema = z.object({
  requestId: z.string().min(1),
  appointmentId: z.string().min(1),
  requestedBy: z.string().min(1),
  requestedByRole: z.string().min(1),
  requestedAt: z.string().min(1),
  originalDate: z.string().min(1),
  originalStartTime: z.string().min(1),
  proposedDate: z.string().min(1),
  proposedStartTime: z.string().min(1),
  reason: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  rescheduleCount: z.number().int().nonnegative(),
});

export const AppointmentSlotSchema = z.object({
  slotId: z.string().min(1),
  facilityId: z.string().min(1),
  providerId: z.string().min(1),
  providerName: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  isAvailable: z.boolean(),
  type: AppointmentTypeSchema.optional(),
  reasonBlocked: z.string().optional(),
});

export const AppointmentScheduleSchema = z.object({
  scheduleId: z.string().min(1),
  providerId: z.string().min(1),
  providerName: z.string().min(1),
  facilityId: z.string().min(1),
  date: z.string().min(1),
  slots: z.array(AppointmentSlotSchema),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

export const CalendarEventSchema = z.object({
  eventId: z.string().min(1),
  appointmentId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  start: z.string().min(1),
  end: z.string().min(1),
  allDay: z.boolean(),
  type: AppointmentTypeSchema,
  status: AppointmentStatusSchema,
  providerId: z.string().optional(),
  providerName: z.string().optional(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  facilityId: z.string().optional(),
  facilityName: z.string().optional(),
  location: AppointmentLocationSchema.optional(),
  color: z.string().optional(),
  isEditable: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const WaitingListEntrySchema = z.object({
  entryId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  patientContact: z.string().optional(),
  requestedType: AppointmentTypeSchema,
  requestedDate: z.string().min(1),
  preferredTime: z.string().optional(),
  preferredProviderId: z.string().optional(),
  priority: AppointmentPrioritySchema,
  status: z.enum(['waiting', 'notified', 'scheduled', 'expired', 'cancelled']),
  createdAt: z.string().min(1),
  notes: z.string().optional(),
  notifiedAt: z.string().optional(),
  notifiedBy: z.string().optional(),
  scheduledAppointmentId: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const AppointmentSchema = z.object({
  recordId: z.string().min(1),
  ownerId: z.string().min(1),
  appointmentId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  patientContact: z.string().optional(),
  appointmentType: AppointmentTypeSchema,
  status: AppointmentStatusSchema,
  priority: AppointmentPrioritySchema,
  source: AppointmentSourceSchema,
  scheduledDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  providerId: z.string().min(1),
  providerName: z.string().min(1),
  facilityId: z.string().min(1),
  facilityName: z.string().min(1),
  department: z.string().optional(),
  participants: z.array(AppointmentParticipantSchema),
  location: AppointmentLocationSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  diagnosis: z.string().optional(),
  cancellation: AppointmentCancellationSchema.optional(),
  rescheduledFrom: z.object({
    previousDate: z.string(),
    previousStartTime: z.string(),
    rescheduleCount: z.number().int().nonnegative(),
  }).optional(),
  followUp: FollowUpAppointmentSchema.optional(),
  reminders: z.array(AppointmentReminderSchema).optional(),
  referralId: z.string().optional(),
  referralSource: z.string().optional(),
  insuranceInfo: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    authorizationNumber: z.string().optional(),
  }).optional(),
  checkInTime: z.string().optional(),
  checkInBy: z.string().optional(),
  startTimeActual: z.string().optional(),
  endTimeActual: z.string().optional(),
  noShowNotified: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: VaultMetadataSchema,
});
