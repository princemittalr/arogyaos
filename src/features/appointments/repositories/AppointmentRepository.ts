import { BaseRepository } from '@/features/health-vault/repositories/BaseRepository';
import { db } from '@/firebase/client';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import type { Appointment } from '../types';

export class AppointmentRepository extends BaseRepository<Appointment> {
  private readonly colRef = collection(db, 'appointments');

  constructor() {
    super('appointments');
  }

  public async getByPatientId(patientId: string): Promise<Appointment[]> {
    const q = query(
      this.colRef,
      where('patientId', '==', patientId),
      orderBy('scheduledDate', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  }

  public async getByProviderId(providerId: string): Promise<Appointment[]> {
    const q = query(
      this.colRef,
      where('providerId', '==', providerId),
      orderBy('scheduledDate', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  }

  public async getByFacilityId(facilityId: string): Promise<Appointment[]> {
    const q = query(
      this.colRef,
      where('facilityId', '==', facilityId),
      orderBy('scheduledDate', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  }

  public async getByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const q = query(
      this.colRef,
      where('scheduledDate', '>=', startDate.toISOString()),
      where('scheduledDate', '<=', endDate.toISOString()),
      orderBy('scheduledDate', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  }

  public async getByStatus(status: string): Promise<Appointment[]> {
    const q = query(
      this.colRef,
      where('status', '==', status),
      orderBy('scheduledDate', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  }

  public async getUpcoming(
    providerId?: string,
    patientId?: string,
  ): Promise<Appointment[]> {
    const constraints = [
      where('status', 'in', ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS']),
      orderBy('scheduledDate', 'asc'),
    ];

    if (providerId) constraints.unshift(where('providerId', '==', providerId));
    if (patientId) constraints.unshift(where('patientId', '==', patientId));

    const q = query(this.colRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  }

  public async getOverlapping(
    providerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ): Promise<Appointment[]> {
    const q = query(
      this.colRef,
      where('providerId', '==', providerId),
      where('scheduledDate', '==', date),
      where('status', 'in', ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS']),
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => d.data() as Appointment);

    return all.filter((a) => {
      if (excludeAppointmentId && a.appointmentId === excludeAppointmentId) return false;
      return a.startTime < endTime && a.endTime > startTime;
    });
  }
}
