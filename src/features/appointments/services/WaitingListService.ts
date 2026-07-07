import { ulid } from '@/features/health-vault/utils/ulid';
import { WaitingListRepository } from '../repositories/WaitingListRepository';
import { AppointmentEventBus } from '../core/events';
import type { WaitingListEntry } from '../types';
import type { AppointmentType, AppointmentPriority } from '../core/constants';

export class WaitingListService {
  private static instance: WaitingListService;
  private readonly waitingListRepo = new WaitingListRepository();
  private readonly eventBus = AppointmentEventBus.getInstance();

  private constructor() {}

  public static getInstance(): WaitingListService {
    if (!WaitingListService.instance) {
      WaitingListService.instance = new WaitingListService();
    }
    return WaitingListService.instance;
  }

  public async joinWaitingList(
    patientId: string,
    patientName: string,
    patientContact: string | undefined,
    requestedType: AppointmentType,
    requestedDate: string,
    priority: AppointmentPriority,
    preferredTime?: string,
    preferredProviderId?: string,
    notes?: string,
    expiryDate?: string,
  ): Promise<string> {
    const entryId = ulid();
    const now = new Date().toISOString();

    const entry: WaitingListEntry = {
      entryId,
      patientId,
      patientName,
      patientContact,
      requestedType,
      requestedDate,
      preferredTime,
      preferredProviderId,
      priority,
      status: 'waiting',
      createdAt: now,
      notes,
      expiryDate,
    };

    await this.waitingListRepo.create(entry);
    return entryId;
  }

  public async removeFromWaitingList(entryId: string): Promise<void> {
    const existing = await this.waitingListRepo.getById(entryId);
    if (!existing) {
      throw new Error(`Waiting list entry "${entryId}" not found.`);
    }

    await this.waitingListRepo.update(entryId, { status: 'cancelled' } as Partial<WaitingListEntry>);
  }

  public async promoteEntry(
    entryId: string,
    slotId: string,
    appointmentId?: string,
  ): Promise<void> {
    const entry = await this.waitingListRepo.getById(entryId);
    if (!entry) {
      throw new Error(`Waiting list entry "${entryId}" not found.`);
    }

    await this.waitingListRepo.update(entryId, {
      status: 'scheduled',
      scheduledAppointmentId: appointmentId,
      notifiedAt: new Date().toISOString(),
    } as Partial<WaitingListEntry>);

    await this.eventBus.publish('WaitingListPromoted', {
      entryId,
      patientId: entry.patientId,
      slotId,
      appointmentId,
      timestamp: new Date(),
    });
  }

  public async getNextInQueue(requestedType: string): Promise<WaitingListEntry | null> {
    const entries = await this.waitingListRepo.getByRequestedType(requestedType);
    return entries.length > 0 ? entries[0] : null;
  }

  public async processExpiredEntries(): Promise<number> {
    const now = new Date().toISOString();
    const expired = await this.waitingListRepo.getExpiredEntries(now);

    for (const entry of expired) {
      await this.waitingListRepo.update(entry.entryId, { status: 'expired' } as Partial<WaitingListEntry>);
    }

    return expired.length;
  }

  public async getPatientEntries(patientId: string): Promise<WaitingListEntry[]> {
    return this.waitingListRepo.getByPatient(patientId);
  }

  public async getQueueOrder(requestedType: string): Promise<WaitingListEntry[]> {
    return this.waitingListRepo.getByRequestedType(requestedType);
  }
}
