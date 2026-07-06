import { db } from '@/firebase/client';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Transaction,
  DocumentSnapshot,
} from 'firebase/firestore';
import { TimelineIndexEntry } from '../types';
import { VaultStatus } from '../core/constants';

export interface TimelineQueryParams {
  patientId: string;
  recordType?: string;
  status?: VaultStatus;
  source?: string;
  startDate?: Date;
  endDate?: Date;
  limitCount?: number;
  lastVisible?: DocumentSnapshot;
}

export class TimelineRepository {
  private readonly collectionName = 'health_vault_timeline_index';

  /**
   * Creates a new timeline index entry, supporting transaction execution.
   */
  public async createIndexEntry(entry: TimelineIndexEntry, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, entry.indexId);
    if (transaction) {
      transaction.set(docRef, entry);
    } else {
      await setDoc(docRef, entry);
    }
  }

  /**
   * Updates an existing index entry, supporting transaction execution.
   */
  public async updateIndexEntry(indexId: string, entry: Partial<TimelineIndexEntry>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, indexId);
    if (transaction) {
      transaction.update(docRef, entry as Record<string, unknown>);
    } else {
      await updateDoc(docRef, entry as Record<string, unknown>);
    }
  }

  /**
   * Fetches an index entry by ID.
   */
  public async getIndexEntry(indexId: string, transaction?: Transaction): Promise<TimelineIndexEntry | null> {
    const docRef = doc(db, this.collectionName, indexId);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as TimelineIndexEntry) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as TimelineIndexEntry) : null;
  }

  /**
   * Performs cursor-based paginated queries with composite filters.
   */
  public async queryTimeline(params: TimelineQueryParams): Promise<{ items: TimelineIndexEntry[]; lastVisible: DocumentSnapshot | null }> {
    const colRef = collection(db, this.collectionName);
    
    // Start building query
    let q = query(colRef, where('patientId', '==', params.patientId));

    if (params.recordType) {
      q = query(q, where('recordType', '==', params.recordType));
    }
    
    if (params.status) {
      q = query(q, where('metadata.status', '==', params.status));
    } else {
      // Exclude archived by default unless specifically queried
      q = query(q, where('metadata.status', '!=', 'ARCHIVED'));
    }

    if (params.source) {
      q = query(q, where('metadata.source', '==', params.source));
    }

    if (params.startDate) {
      q = query(q, where('encounterDate', '>=', params.startDate));
    }

    if (params.endDate) {
      q = query(q, where('encounterDate', '<=', params.endDate));
    }

    // Default sorting: chronological descending (encounterDate DESC)
    q = query(q, orderBy('encounterDate', 'desc'));

    // Pagination
    if (params.lastVisible) {
      q = query(q, startAfter(params.lastVisible));
    }

    const pageSize = params.limitCount || 20;
    q = query(q, limit(pageSize));

    const snap = await getDocs(q);
    const items = snap.docs.map(d => d.data() as TimelineIndexEntry);
    const lastVisible = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

    return { items, lastVisible };
  }
}
export default TimelineRepository;
