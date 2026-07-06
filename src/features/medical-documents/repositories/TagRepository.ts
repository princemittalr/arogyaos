import { db } from '@/firebase/client';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, Transaction } from 'firebase/firestore';
import { Tag, DocumentMapping } from '../types';

export class TagRepository {
  protected readonly collectionName = 'vault_tags';
  private readonly mappingsCollection = 'vault_document_mappings';

  /**
   * Fetches a tag by its identifier.
   */
  public async getById(id: string, transaction?: Transaction): Promise<Tag | null> {
    const docRef = doc(db, this.collectionName, id);
    if (transaction) {
      const snap = await transaction.get(docRef);
      return snap.exists() ? (snap.data() as Tag) : null;
    }
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Tag) : null;
  }

  /**
   * Creates a new tag.
   */
  public async create(tag: Tag, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, tag.tagId);
    if (transaction) {
      transaction.set(docRef, tag);
    } else {
      await setDoc(docRef, tag);
    }
  }

  /**
   * Updates an existing tag.
   */
  public async update(tagId: string, data: Partial<Tag>, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, tagId);
    if (transaction) {
      transaction.update(docRef, data as Record<string, unknown>);
    } else {
      await updateDoc(docRef, data as Record<string, unknown>);
    }
  }

  /**
   * Deletes a tag.
   */
  public async delete(tagId: string, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.collectionName, tagId);
    if (transaction) {
      transaction.delete(docRef);
    } else {
      await deleteDoc(docRef);
    }
  }

  /**
   * Fetches all tags owned by a specific patient/user.
   */
  public async getTagsByOwner(ownerId: string): Promise<Tag[]> {
    const colRef = collection(db, this.collectionName);
    const q = query(colRef, where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Tag);
  }

  /**
   * Fetches all document mappings owned by a user.
   */
  public async getDocumentMappingsByOwner(ownerId: string): Promise<DocumentMapping[]> {
    const colRef = collection(db, this.mappingsCollection);
    const q = query(colRef, where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as DocumentMapping);
  }

  /**
   * Fetches a specific document's mapping details.
   */
  public async getMappingByRecordId(recordId: string, ownerId: string): Promise<DocumentMapping | null> {
    const colRef = collection(db, this.mappingsCollection);
    const q = query(colRef, where('recordId', '==', recordId), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as DocumentMapping;
  }

  /**
   * Saves or updates a document mapping record.
   */
  public async saveDocumentMapping(mapping: DocumentMapping, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.mappingsCollection, mapping.mappingId);
    if (transaction) {
      transaction.set(docRef, mapping);
    } else {
      await setDoc(docRef, mapping);
    }
  }

  /**
   * Deletes a document mapping record.
   */
  public async deleteDocumentMapping(mappingId: string, transaction?: Transaction): Promise<void> {
    const docRef = doc(db, this.mappingsCollection, mappingId);
    if (transaction) {
      transaction.delete(docRef);
    } else {
      await deleteDoc(docRef);
    }
  }

  /**
   * Deletes document mapping by recordId.
   */
  public async deleteMappingByRecordId(recordId: string): Promise<void> {
    const colRef = collection(db, this.mappingsCollection);
    const q = query(colRef, where('recordId', '==', recordId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, this.mappingsCollection, d.id));
    }
  }
}

export default TagRepository;
