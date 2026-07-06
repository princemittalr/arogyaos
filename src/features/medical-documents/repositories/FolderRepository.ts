import { db } from '@/firebase/client';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, Transaction } from 'firebase/firestore';
import { Folder } from '../types';

export class FolderRepository {
  protected readonly collectionName = 'vault_folders';

  /**
   * Fetches a folder by its identifier.
   */
  public async getById(id: string, transaction?: Transaction): Promise<Folder | null> {
    const docRef = doc(db, this.collectionName, id);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as Folder) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Folder) : null;
  }

  /**
   * Creates a new folder.
   */
  public async create(folder: Folder, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, folder.folderId);
    if (transaction) {
      transaction.set(docRef, folder);
    } else {
      await setDoc(docRef, folder);
    }
  }

  /**
   * Updates an existing folder.
   */
  public async update(folderId: string, data: Partial<Folder>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, folderId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  /**
   * Deletes a folder.
   */
  public async delete(folderId: string, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, folderId);
    if (transaction) {
      transaction.delete(docRef);
    } else {
      await deleteDoc(docRef);
    }
  }

  /**
   * Fetches all folders owned by a specific patient/user.
   */
  public async getFoldersByOwner(ownerId: string): Promise<Folder[]> {
    const colRef = collection(db, this.collectionName);
    const q = query(colRef, where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Folder);
  }
}

export default FolderRepository;
