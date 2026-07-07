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
import { VaccineSchedule } from '../types';

export class ScheduleRepository {
  private readonly collectionName = 'vaccination_schedules';
  private readonly colRef = collection(db, this.collectionName);

  public async getById(
    scheduleId: string,
    transaction?: Transaction,
  ): Promise<VaccineSchedule | null> {
    const docRef = doc(db, this.collectionName, scheduleId);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as VaccineSchedule) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as VaccineSchedule) : null;
  }

  public async getByPatientId(patientId: string): Promise<VaccineSchedule[]> {
    const q = query(this.colRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccineSchedule);
  }

  public async getByStatus(status: string): Promise<VaccineSchedule[]> {
    const q = query(this.colRef, where('status', '==', status));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccineSchedule);
  }

  public async create(
    schedule: VaccineSchedule,
    transaction?: Transaction,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, schedule.scheduleId);
    if (transaction) {
      transaction.set(docRef, schedule);
    } else {
      await setDoc(docRef, schedule);
    }
  }

  public async update(
    scheduleId: string,
    data: Partial<VaccineSchedule>,
    transaction?: Transaction,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, scheduleId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  public async delete(
    scheduleId: string,
    transaction?: Transaction,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, scheduleId);
    if (transaction) {
      transaction.delete(docRef);
    } else {
      await deleteDoc(docRef);
    }
  }
}
