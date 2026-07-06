import { db } from '@/firebase/client';
import { doc, getDoc, setDoc, updateDoc, Transaction } from 'firebase/firestore';
import { BaseVaultRecord } from '../types';

export class BaseRepository<T extends BaseVaultRecord> {
  constructor(protected readonly collectionName: string) {}

  /**
   * Fetches a record by its identifier, with optional transaction support.
   */
  public async getById(id: string, transaction?: Transaction): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as T) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as T) : null;
  }

  /**
   * Creates a new record in the collection, with optional transaction support.
   */
  public async create(record: T, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, record.recordId);
    if (transaction) {
      transaction.set(docRef, record);
    } else {
      await setDoc(docRef, record);
    }
  }

  /**
   * Updates an existing record's fields, with optional transaction support.
   */
  public async update(recordId: string, data: Partial<T>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, recordId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  /**
   * Creates a historical snapshot copy in the 'versions' sub-collection.
   */
  public async createVersion(
    recordId: string,
    versionNumber: number,
    record: T,
    transaction?: Transaction
  ): Promise<void> {
    const versionDocRef = doc(db, this.collectionName, recordId, 'versions', versionNumber.toString());
    if (transaction) {
      transaction.set(versionDocRef, record);
    } else {
      await setDoc(versionDocRef, record);
    }
  }

  /**
   * Fetches a historical snapshot copy from the 'versions' sub-collection.
   */
  public async getVersion(
    recordId: string,
    versionNumber: number,
    transaction?: Transaction
  ): Promise<T | null> {
    const versionDocRef = doc(db, this.collectionName, recordId, 'versions', versionNumber.toString());
    if (transaction) {
      const snap = await transaction.get(versionDocRef);
      return snap.exists() ? (snap.data() as T) : null;
    }
    const snap = await getDoc(versionDocRef);
    return snap.exists() ? (snap.data() as T) : null;
  }
}
