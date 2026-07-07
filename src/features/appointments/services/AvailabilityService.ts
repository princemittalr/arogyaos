import { ulid } from '@/features/health-vault/utils/ulid';
import { AvailabilityRepository } from '../repositories/AvailabilityRepository';
import type { AppointmentAvailability } from '../types';

export class AvailabilityService {
  private static instance: AvailabilityService;
  private readonly availabilityRepo = new AvailabilityRepository();

  private constructor() {}

  public static getInstance(): AvailabilityService {
    if (!AvailabilityService.instance) {
      AvailabilityService.instance = new AvailabilityService();
    }
    return AvailabilityService.instance;
  }

  public async setDoctorAvailability(
    providerId: string,
    providerName: string,
    facilityId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number = 0,
  ): Promise<string> {
    return this.setAvailability(
      providerId,
      providerName,
      facilityId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      bufferMinutes,
    );
  }

  public async setLaboratoryAvailability(
    providerId: string,
    providerName: string,
    facilityId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number = 0,
  ): Promise<string> {
    return this.setAvailability(
      providerId,
      providerName,
      facilityId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      bufferMinutes,
    );
  }

  public async setRadiologyAvailability(
    providerId: string,
    providerName: string,
    facilityId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number = 0,
  ): Promise<string> {
    return this.setAvailability(
      providerId,
      providerName,
      facilityId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      bufferMinutes,
    );
  }

  public async setVaccinationAvailability(
    providerId: string,
    providerName: string,
    facilityId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number = 0,
  ): Promise<string> {
    return this.setAvailability(
      providerId,
      providerName,
      facilityId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      bufferMinutes,
    );
  }

  public async setPharmacyAvailability(
    providerId: string,
    providerName: string,
    facilityId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number = 0,
  ): Promise<string> {
    return this.setAvailability(
      providerId,
      providerName,
      facilityId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      bufferMinutes,
    );
  }

  public async removeAvailability(availabilityId: string): Promise<void> {
    await this.availabilityRepo.delete(availabilityId);
  }

  public async getProviderAvailability(providerId: string): Promise<AppointmentAvailability[]> {
    return this.availabilityRepo.getByProvider(providerId);
  }

  public async getFacilityAvailability(facilityId: string): Promise<AppointmentAvailability[]> {
    return this.availabilityRepo.getByFacility(facilityId);
  }

  private async setAvailability(
    providerId: string,
    providerName: string,
    facilityId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number,
  ): Promise<string> {
    const availabilityId = ulid();

    const availability: AppointmentAvailability = {
      availabilityId,
      providerId,
      providerName,
      facilityId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      bufferMinutes,
      isAvailable: true,
    };

    await this.availabilityRepo.create(availability);
    return availabilityId;
  }
}
