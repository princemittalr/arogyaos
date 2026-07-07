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
  orderBy,
  getDocs,
  Transaction,
} from 'firebase/firestore';
import type { WaitingListEntry } from '../types';

const COLLECTION = 'appointment_waiting_list';

export class WaitingListRepository {
  public async getById(id: string, transaction?: Transaction): Promise<WaitingListEntry | null> {
    const docRef = doc(db, COLLECTION, id);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as WaitingListEntry) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as WaitingListEntry) : null;
  }

  public async create(entry: WaitingListEntry, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, COLLECTION, entry.entryId);
    if (transaction) {
      transaction.set(docRef, entry);
    } else {
      await setDoc(docRef, entry);
    }
  }

  public async update(entryId: string, data: Partial<WaitingListEntry>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, COLLECTION, entryId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  public async delete(entryId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, entryId));
  }

  public async getByPatient(patientId: string): Promise<WaitingListEntry[]> {
    const q = query(
      collection(db, COLLECTION),
      where('patientId', '==', patientId),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WaitingListEntry);
  }

  public async getByRequestedType(requestedType: string): Promise<WaitingListEntry[]> {
    const q = query(
      collection(db, COLLECTION),
      where('requestedType', '==', requestedType),
      where('status', '==', 'waiting'),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WaitingListEntry);
  }

  public async getActiveByPriority(): Promise<WaitingListEntry[]> {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', 'waiting'),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WaitingListEntry);
  }

  public async getExpiredEntries(now: string): Promise<WaitingListEntry[]> {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', 'waiting'),
      where('expiryDate', '<=', now),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WaitingListEntry);
  }
}
