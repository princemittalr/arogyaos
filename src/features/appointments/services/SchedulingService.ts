import { ulid } from '@/features/health-vault/utils/ulid';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import { AvailabilityRepository } from '../repositories/AvailabilityRepository';
import { DEFAULT_SLOT_DURATION_MINUTES } from '../core/constants';
import type { AppointmentSlot, AppointmentSchedule } from '../types';

export class SchedulingService {
  private static instance: SchedulingService;
  private readonly scheduleRepo = new ScheduleRepository();
  private readonly availabilityRepo = new AvailabilityRepository();

  private constructor() {}

  public static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService();
    }
    return SchedulingService.instance;
  }

  public async generateDailySchedule(
    providerId: string,
    providerName: string,
    facilityId: string,
    date: string,
    slotDurationMinutes: number = DEFAULT_SLOT_DURATION_MINUTES,
    bufferMinutes: number = 0,
  ): Promise<AppointmentSchedule> {
    const availability = await this.availabilityRepo.getByProvider(providerId);
    const dayOfWeek = new Date(date).getDay();

    const dayAvailability = availability.find(
      (a) => a.dayOfWeek === dayOfWeek && a.isAvailable,
    );

    if (!dayAvailability) {
      throw new Error(`No availability configured for provider "${providerId}" on day ${dayOfWeek}.`);
    }

    const slots = this.generateSlots(
      date,
      dayAvailability.startTime,
      dayAvailability.endTime,
      slotDurationMinutes,
      bufferMinutes,
      providerId,
      providerName,
      facilityId,
    );

    const scheduleId = ulid();
    const schedule: AppointmentSchedule = {
      scheduleId,
      providerId,
      providerName,
      facilityId,
      date,
      slots,
      isActive: true,
    };

    await this.scheduleRepo.create(schedule);
    return schedule;
  }

  public async generateWeeklySchedule(
    providerId: string,
    providerName: string,
    facilityId: string,
    startDate: string,
    slotDurationMinutes: number = DEFAULT_SLOT_DURATION_MINUTES,
    bufferMinutes: number = 0,
  ): Promise<AppointmentSchedule[]> {
    const schedules: AppointmentSchedule[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];

      try {
        const schedule = await this.generateDailySchedule(
          providerId,
          providerName,
          facilityId,
          dateStr,
          slotDurationMinutes,
          bufferMinutes,
        );
        schedules.push(schedule);
      } catch {
        continue;
      }
    }

    return schedules;
  }

  public async generateMonthlySchedule(
    providerId: string,
    providerName: string,
    facilityId: string,
    year: number,
    month: number,
    slotDurationMinutes: number = DEFAULT_SLOT_DURATION_MINUTES,
    bufferMinutes: number = 0,
  ): Promise<AppointmentSchedule[]> {
    const schedules: AppointmentSchedule[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      try {
        const schedule = await this.generateDailySchedule(
          providerId,
          providerName,
          facilityId,
          dateStr,
          slotDurationMinutes,
          bufferMinutes,
        );
        schedules.push(schedule);
      } catch {
        continue;
      }
    }

    return schedules;
  }

  public async reserveSlot(slotId: string, scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepo.getById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found.`);
    }

    const slotIndex = schedule.slots.findIndex((s) => s.slotId === slotId);
    if (slotIndex === -1) {
      throw new Error(`Slot "${slotId}" not found in schedule "${scheduleId}".`);
    }

    if (!schedule.slots[slotIndex].isAvailable) {
      throw new Error(`Slot "${slotId}" is already reserved.`);
    }

    const updatedSlots = [...schedule.slots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      isAvailable: false,
    };

    await this.scheduleRepo.update(scheduleId, { slots: updatedSlots } as Partial<AppointmentSchedule>);
  }

  public async releaseSlot(slotId: string, scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepo.getById(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule "${scheduleId}" not found.`);
    }

    const slotIndex = schedule.slots.findIndex((s) => s.slotId === slotId);
    if (slotIndex === -1) {
      throw new Error(`Slot "${slotId}" not found in schedule "${scheduleId}".`);
    }

    const updatedSlots = [...schedule.slots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      isAvailable: true,
    };

    await this.scheduleRepo.update(scheduleId, { slots: updatedSlots } as Partial<AppointmentSchedule>);
  }

  public async getDailySchedule(providerId: string, date: string): Promise<AppointmentSchedule | null> {
    return this.scheduleRepo.getByProviderAndDate(providerId, date);
  }

  public async getWeeklySchedule(
    providerId: string,
    startDate: string,
  ): Promise<AppointmentSchedule[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endStr = endDate.toISOString().split('T')[0];
    return this.scheduleRepo.getByDateRange(providerId, startDate, endStr);
  }

  public async getMonthlySchedule(
    providerId: string,
    year: number,
    month: number,
  ): Promise<AppointmentSchedule[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    return this.scheduleRepo.getByDateRange(providerId, startDate, endDate);
  }

  private generateSlots(
    date: string,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    bufferMinutes: number,
    providerId: string,
    providerName: string,
    facilityId: string,
  ): AppointmentSlot[] {
    const slots: AppointmentSlot[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const stepMinutes = slotDurationMinutes + bufferMinutes;

    while (currentMinutes + slotDurationMinutes <= endMinutes) {
      const slotStartHour = Math.floor(currentMinutes / 60);
      const slotStartMin = currentMinutes % 60;
      const slotEndMinutes = currentMinutes + slotDurationMinutes;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMin = slotEndMinutes % 60;

      slots.push({
        slotId: ulid(),
        facilityId,
        providerId,
        providerName,
        date,
        startTime: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`,
        endTime: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`,
        durationMinutes: slotDurationMinutes,
        isAvailable: true,
      });

      currentMinutes += stepMinutes;
    }

    return slots;
  }
}
