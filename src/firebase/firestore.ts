import { db } from './client';
import {
  collection,
  doc,
  DocumentData,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';

// Helper to create type-safe collection references
export const createCollectionRef = <T = DocumentData>(
  collectionName: string
): CollectionReference<T> => {
  return collection(db, collectionName) as CollectionReference<T>;
};

// Helper to create type-safe document references
export const createDocRef = <T = DocumentData>(
  collectionName: string,
  docId: string
): DocumentReference<T> => {
  return doc(db, collectionName, docId) as DocumentReference<T>;
};
export default db;
