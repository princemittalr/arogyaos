import { db } from '@/firebase/client';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Transaction } from 'firebase/firestore';
import { VaultFileMetadata } from '../types/storage';

export class StorageRepository {
  private readonly collectionName = 'health_vault_file_metadata';

  /**
   * Saves metadata for an uploaded file.
   */
  public async saveFileMetadata(metadata: VaultFileMetadata, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, metadata.fileId);
    if (transaction) {
      transaction.set(docRef, metadata);
    } else {
      await setDoc(docRef, metadata);
    }
  }

  /**
   * Fetches metadata for a file by its identifier.
   */
  public async getFileMetadata(fileId: string, transaction?: Transaction): Promise<VaultFileMetadata | null> {
    const docRef = doc(db, this.collectionName, fileId);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as VaultFileMetadata) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as VaultFileMetadata) : null;
  }

  /**
   * Updates existing metadata fields for a file.
   */
  public async updateFileMetadata(fileId: string, updates: Partial<VaultFileMetadata>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, fileId);
    if (transaction) {
      transaction.update(docRef, updates as Record<string, unknown>);
    } else {
      await updateDoc(docRef, updates as Record<string, unknown>);
    }
  }

  /**
   * Queries metadata records associated with a specific medical record.
   */
  public async getFileMetadataByRecordId(recordId: string): Promise<VaultFileMetadata[]> {
    const colRef = collection(db, this.collectionName);
    const q = query(colRef, where('recordId', '==', recordId), where('status', '==', 'ACTIVE'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as VaultFileMetadata);
  }

  /**
   * Saves a historical snapshot of file metadata under versions sub-collection.
   */
  public async saveFileMetadataVersion(fileId: string, version: number, metadata: VaultFileMetadata, transaction?: Transaction): Promise<void> {
    const versionDocRef = doc(db, this.collectionName, fileId, 'versions', version.toString());
    if (transaction) {
      transaction.set(versionDocRef, metadata);
    } else {
      await setDoc(versionDocRef, metadata);
    }
  }

  /**
   * Retrieves historical version of file metadata.
   */
  public async getFileMetadataVersion(fileId: string, version: number): Promise<VaultFileMetadata | null> {
    const versionDocRef = doc(db, this.collectionName, fileId, 'versions', version.toString());
    const snap = await getDoc(versionDocRef);
    return snap.exists() ? (snap.data() as VaultFileMetadata) : null;
  }
}
export default StorageRepository;
