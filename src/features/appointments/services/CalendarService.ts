import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { ScheduleRepository } from '../repositories/ScheduleRepository';
import type { CalendarEvent, Appointment } from '../types';

export class CalendarService {
  private static instance: CalendarService;
  private readonly appointmentRepo = new AppointmentRepository();
  private readonly scheduleRepo = new ScheduleRepository();

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  public async getDayEvents(
    date: string,
    providerId?: string,
    facilityId?: string,
  ): Promise<CalendarEvent[]> {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.queryEvents(startDate, endDate, providerId, facilityId);
  }

  public async getWeekEvents(
    startDate: Date,
    providerId?: string,
    facilityId?: string,
  ): Promise<CalendarEvent[]> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return this.queryEvents(startDate, endDate, providerId, facilityId);
  }

  public async getMonthEvents(
    year: number,
    month: number,
    providerId?: string,
    facilityId?: string,
  ): Promise<CalendarEvent[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return this.queryEvents(startDate, endDate, providerId, facilityId);
  }

  public async getAgendaEvents(
    startDate: Date,
    endDate: Date,
    providerId?: string,
    facilityId?: string,
  ): Promise<CalendarEvent[]> {
    return this.queryEvents(startDate, endDate, providerId, facilityId);
  }

  private async queryEvents(
    startDate: Date,
    endDate: Date,
    providerId?: string,
    facilityId?: string,
  ): Promise<CalendarEvent[]> {
    const appointments = await this.appointmentRepo.getByDateRange(startDate, endDate);
    return this.toCalendarEvents(this.filterByScope(appointments, providerId, facilityId));
  }

  private filterByScope(
    appointments: Appointment[],
    providerId?: string,
    facilityId?: string,
  ): Appointment[] {
    let filtered = appointments;
    if (providerId) {
      filtered = filtered.filter((a) => a.providerId === providerId);
    }
    if (facilityId) {
      filtered = filtered.filter((a) => a.facilityId === facilityId);
    }
    return filtered;
  }

  private toCalendarEvents(appointments: Appointment[]): CalendarEvent[] {
    return appointments.map((a) => ({
      eventId: a.appointmentId,
      appointmentId: a.appointmentId,
      title: `${a.appointmentType} - ${a.patientName}`,
      description: a.reason,
      start: `${a.scheduledDate}T${a.startTime}`,
      end: `${a.scheduledDate}T${a.endTime}`,
      allDay: false,
      type: a.appointmentType,
      status: a.status,
      providerId: a.providerId,
      providerName: a.providerName,
      patientId: a.patientId,
      patientName: a.patientName,
      facilityId: a.facilityId,
      facilityName: a.facilityName,
      location: a.location,
      isEditable: a.status === 'SCHEDULED' || a.status === 'CONFIRMED',
      metadata: {
        priority: a.priority,
        source: a.source,
      },
    }));
  }
}
