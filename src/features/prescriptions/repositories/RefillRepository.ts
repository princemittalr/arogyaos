import { db } from '@/firebase/client';
import { collection, doc, getDocs, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { RefillTransaction } from '../types';

export class RefillRepository {
  /**
   * Fetch all refill transactions for a specific prescription.
   */
  public async getByPrescriptionId(prescriptionId: string): Promise<RefillTransaction[]> {
    const colRef = collection(db, 'prescriptions', prescriptionId, 'refills');
    const q = query(colRef, orderBy('requestedAt', 'desc'));
    const snap = await getDocs(q);
    
    return snap.docs.map((d) => d.data() as RefillTransaction);
  }

  /**
   * Record a new refill request transaction.
   */
  public async createRefill(prescriptionId: string, transaction: RefillTransaction): Promise<void> {
    const docRef = doc(db, 'prescriptions', prescriptionId, 'refills', transaction.refillId);
    await setDoc(docRef, transaction);
  }

  /**
   * Update a refill transaction's status.
   */
  public async updateRefillStatus(
    prescriptionId: string,
    refillId: string,
    data: Partial<RefillTransaction>
  ): Promise<void> {
    const docRef = doc(db, 'prescriptions', prescriptionId, 'refills', refillId);
    await updateDoc(docRef, data);
  }
}
