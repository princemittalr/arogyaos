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
import type { AppointmentAvailability } from '../types';

const COLLECTION = 'appointment_availability';

export class AvailabilityRepository {
  public async getById(id: string, transaction?: Transaction): Promise<AppointmentAvailability | null> {
    const docRef = doc(db, COLLECTION, id);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as AppointmentAvailability) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as AppointmentAvailability) : null;
  }

  public async create(availability: AppointmentAvailability, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, COLLECTION, availability.availabilityId);
    if (transaction) {
      transaction.set(docRef, availability);
    } else {
      await setDoc(docRef, availability);
    }
  }

  public async update(availabilityId: string, data: Partial<AppointmentAvailability>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, COLLECTION, availabilityId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  public async delete(availabilityId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, availabilityId));
  }

  public async getByProvider(providerId: string): Promise<AppointmentAvailability[]> {
    const q = query(
      collection(db, COLLECTION),
      where('providerId', '==', providerId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppointmentAvailability);
  }

  public async getByFacility(facilityId: string): Promise<AppointmentAvailability[]> {
    const q = query(
      collection(db, COLLECTION),
      where('facilityId', '==', facilityId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AppointmentAvailability);
  }

  public async getByDayOfWeek(
    providerId: string,
    dayOfWeek: number,
  ): Promise<AppointmentAvailability | null> {
    const q = query(
      collection(db, COLLECTION),
      where('providerId', '==', providerId),
      where('dayOfWeek', '==', dayOfWeek),
      where('isAvailable', '==', true),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AppointmentAvailability;
  }
}
