import { db } from '@/firebase/client';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Transaction,
} from 'firebase/firestore';
import type { AppointmentSchedule } from '../types';

const COLLECTION = 'appointment_schedules';

export class ScheduleRepository {
  public async getById(id: string, transaction?: Transaction): Promise<AppointmentSchedule | null> {
    const docRef = doc(db, COLLECTION, id);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as AppointmentSchedule) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as AppointmentSchedule) : null;
  }

  public async create(schedule: AppointmentSchedule, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, COLLECTION, schedule.scheduleId);
    if (transaction) {
      transaction.set(docRef, schedule);
    } else {
      await setDoc(docRef, schedule);
    }
  }

  public async update(scheduleId: string, data: Partial<AppointmentSchedule>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, COLLECTION, scheduleId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  public async delete(scheduleId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, scheduleId));
  }

  public async getByProviderAndDate(
    providerId: string,
    date: string,
  ): Promise<AppointmentSchedule | null> {
    const q = query(
      collection(db, COLLECTION),
      where('providerId', '==', providerId),
      where('date', '==', date),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AppointmentSchedule;
  }

  public async getByFacilityAndDate(
    facilityId: string,
    date: string,
  ): Promise<AppointmentSchedule[]> {
    const q = query(
      collection(db, COLLECTION),
      where('facilityId', '==', facilityId),
      where('date', '==', date),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppointmentSchedule);
  }

  public async getByDateRange(
    providerId: string,
    startDate: string,
    endDate: string,
  ): Promise<AppointmentSchedule[]> {
    const q = query(
      collection(db, COLLECTION),
      where('providerId', '==', providerId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppointmentSchedule);
  }
}
