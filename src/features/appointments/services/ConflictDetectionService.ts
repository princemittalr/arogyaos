import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { DoubleBookingError } from '../core/errors';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: 'double_booking' | 'provider_conflict' | 'patient_conflict' | 'room_conflict' | 'equipment_conflict';
    resourceId: string;
    resourceType: string;
    reason: string;
  }>;
}

export class ConflictDetectionService {
  private static instance: ConflictDetectionService;
  private readonly appointmentRepo = new AppointmentRepository();

  private constructor() {}

  public static getInstance(): ConflictDetectionService {
    if (!ConflictDetectionService.instance) {
      ConflictDetectionService.instance = new ConflictDetectionService();
    }
    return ConflictDetectionService.instance;
  }

  public async detectDoubleBooking(
    providerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<ConflictCheckResult> {
    const overlapping = await this.appointmentRepo.getOverlapping(
      providerId,
      date,
      startTime,
      endTime,
      excludeAppointmentId,
    );

    if (overlapping.length > 0) {
      return {
        hasConflict: true,
        conflicts: overlapping.map((a) => ({
          type: 'double_booking' as const,
          resourceId: a.appointmentId,
          resourceType: 'appointment',
          reason: `Provider "${providerId}" already booked from ${a.startTime} to ${a.endTime}.`,
        })),
      };
    }

    return { hasConflict: false, conflicts: [] };
  }

  public async detectPatientConflict(
    patientId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<ConflictCheckResult> {
    const patientAppointments = await this.appointmentRepo.getByPatientId(patientId);

    const overlapping = patientAppointments.filter((a) => {
      if (excludeAppointmentId && a.appointmentId === excludeAppointmentId) return false;
      if (a.scheduledDate !== date) return false;
      if (!['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)) return false;
      return a.startTime < endTime && a.endTime > startTime;
    });

    if (overlapping.length > 0) {
      return {
        hasConflict: true,
        conflicts: overlapping.map((a) => ({
          type: 'patient_conflict' as const,
          resourceId: patientId,
          resourceType: 'patient',
          reason: `Patient "${patientId}" already has an appointment from ${a.startTime} to ${a.endTime} with ${a.providerName}.`,
        })),
      };
    }

    return { hasConflict: false, conflicts: [] };
  }

  public async detectRoomConflict(
    facilityId: string,
    date: string,
    startTime: string,
    endTime: string,
    room: string,
    excludeAppointmentId?: string,
  ): Promise<ConflictCheckResult> {
    const facilityAppointments = await this.appointmentRepo.getByFacilityId(facilityId);

    const overlapping = facilityAppointments.filter((a) => {
      if (excludeAppointmentId && a.appointmentId === excludeAppointmentId) return false;
      if (a.scheduledDate !== date) return false;
      if (!['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)) return false;
      if (a.location.room !== room) return false;
      return a.startTime < endTime && a.endTime > startTime;
    });

    if (overlapping.length > 0) {
      return {
        hasConflict: true,
        conflicts: overlapping.map((a) => ({
          type: 'room_conflict' as const,
          resourceId: room,
          resourceType: 'room',
          reason: `Room "${room}" is already booked from ${a.startTime} to ${a.endTime}.`,
        })),
      };
    }

    return { hasConflict: false, conflicts: [] };
  }

  public async detectEquipmentConflict(
    facilityId: string,
    equipmentId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<ConflictCheckResult> {
    const facilityAppointments = await this.appointmentRepo.getByFacilityId(facilityId);

    const overlapping = facilityAppointments.filter((a) => {
      if (a.scheduledDate !== date) return false;
      if (!['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status)) return false;
      return a.startTime < endTime && a.endTime > startTime;
    });

    if (overlapping.length > 0) {
      return {
        hasConflict: true,
        conflicts: overlapping.map((a) => ({
          type: 'equipment_conflict' as const,
          resourceId: equipmentId,
          resourceType: 'equipment',
          reason: `Equipment "${equipmentId}" may have conflict with appointment from ${a.startTime} to ${a.endTime}.`,
        })),
      };
    }

    return { hasConflict: false, conflicts: [] };
  }

  public async assertNoConflict(
    providerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const result = await this.detectDoubleBooking(
      providerId,
      date,
      startTime,
      endTime,
      excludeAppointmentId,
    );

    if (result.hasConflict) {
      throw new DoubleBookingError(providerId, date, startTime);
    }
  }
}
