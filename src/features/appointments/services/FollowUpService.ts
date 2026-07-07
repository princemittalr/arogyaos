import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { AppointmentService } from './AppointmentService';
import type { FollowUpAppointment } from '../types';
import type { AppointmentType, AppointmentPriority } from '../core/constants';
import type { VaultOrigin } from '@/features/health-vault/types';
import { AppointmentNotFoundError } from '../core/errors';

export interface FollowUpSuggestion {
  recommendedIntervalDays: number;
  reason: string;
  priority: AppointmentPriority;
}

export const FOLLOW_UP_INTERVALS: Record<string, FollowUpSuggestion> = {
  GENERAL_CONSULTATION: { recommendedIntervalDays: 14, reason: 'Routine follow-up after general consultation', priority: 'ROUTINE' },
  SPECIALIST_CONSULTATION: { recommendedIntervalDays: 30, reason: 'Specialist review follow-up', priority: 'URGENT' },
  TELEMEDICINE: { recommendedIntervalDays: 14, reason: 'Follow-up after telemedicine consultation', priority: 'ROUTINE' },
  SURGERY: { recommendedIntervalDays: 7, reason: 'Post-operative follow-up', priority: 'URGENT' },
  HEALTH_CHECKUP: { recommendedIntervalDays: 365, reason: 'Annual health checkup follow-up', priority: 'ROUTINE' },
  VACCINATION: { recommendedIntervalDays: 90, reason: 'Vaccination follow-up / next dose', priority: 'ROUTINE' },
  LABORATORY: { recommendedIntervalDays: 7, reason: 'Lab result discussion follow-up', priority: 'ROUTINE' },
  RADIOLOGY: { recommendedIntervalDays: 7, reason: 'Imaging result discussion follow-up', priority: 'URGENT' },
};

export class FollowUpService {
  private static instance: FollowUpService;
  private readonly appointmentRepo = new AppointmentRepository();
  private readonly appointmentService = AppointmentService.getInstance();

  private constructor() {}

  public static getInstance(): FollowUpService {
    if (!FollowUpService.instance) {
      FollowUpService.instance = new FollowUpService();
    }
    return FollowUpService.instance;
  }

  public async createFollowUp(
    originalAppointmentId: string,
    recommendedDate: string,
    recommendedBy: string,
    reason: string,
    ownerId: string,
    actorRole: string,
    origin: VaultOrigin,
  ): Promise<string> {
    const original = await this.appointmentRepo.getById(originalAppointmentId);
    if (!original) {
      throw new AppointmentNotFoundError(originalAppointmentId);
    }

    return await this.appointmentService.createAppointment(
      {
        patientId: original.patientId,
        patientName: original.patientName,
        patientContact: original.patientContact,
        appointmentType: 'FOLLOW_UP',
        priority: 'ROUTINE',
        source: 'SYSTEM_GENERATED',
        scheduledDate: recommendedDate,
        startTime: original.startTime,
        durationMinutes: original.durationMinutes,
        providerId: original.providerId,
        providerName: original.providerName,
        facilityId: original.facilityId,
        facilityName: original.facilityName,
        department: original.department,
        participants: original.participants,
        location: original.location,
        reason: `Follow-up: ${reason}`,
        tags: ['follow-up', `follows-${originalAppointmentId}`],
      },
      {
        ownerId,
        createdBy: recommendedBy,
        actorRole,
        source: 'provider',
        origin,
      },
    );
  }

  public getSuggestedInterval(appointmentType: AppointmentType): FollowUpSuggestion {
    const interval = FOLLOW_UP_INTERVALS[appointmentType];
    if (!interval) {
      return {
        recommendedIntervalDays: 30,
        reason: `General follow-up after ${appointmentType.toLowerCase().replace(/_/g, ' ')}`,
        priority: 'ROUTINE',
      };
    }
    return interval;
  }

  public async getFollowUpHistory(patientId: string): Promise<FollowUpAppointment[]> {
    const appointments = await this.appointmentRepo.getByPatientId(patientId);
    const followUps: FollowUpAppointment[] = [];

    for (const appointment of appointments) {
      if (appointment.followUp) {
        followUps.push(appointment.followUp);
      }
      if (appointment.appointmentType === 'FOLLOW_UP') {
        const followUpEntry: FollowUpAppointment = {
          followUpId: `${appointment.appointmentId}_followup`,
          originalAppointmentId: appointment.referralId ?? appointment.appointmentId,
          patientId: appointment.patientId,
          recommendedDate: appointment.scheduledDate,
          recommendedBy: appointment.providerId,
          reason: appointment.reason ?? 'Follow-up consultation',
          status: appointment.status === 'COMPLETED' ? 'completed' : 'scheduled',
          scheduledAppointmentId: appointment.appointmentId,
        };
        followUps.push(followUpEntry);
      }
    }

    return followUps;
  }
}
