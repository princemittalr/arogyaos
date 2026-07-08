import { normalizePrescription } from '@/features/prescriptions/utils/normalizePrescription';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/firebase/client';
import { PrescriptionDocument } from '@/firebase/types';
import { validateDoc, inventoryItemSchema } from '@/firebase/validation';

export interface InventoryItem {
  inventoryId: string;
  hospitalId: string;
  medicineId: string;
  medicineName: string;
  category: string;
  quantity: number;
  minimumStock: number;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  supplier: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface DispensationLog {
  dispenseId: string;
  recordId: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  medicines: Array<{
    medicineId: string;
    name: string;
    quantity: number;
  }>;
  dispensedAt: string;
  dispensedBy: string;
}

export class PharmacyService {
  static async getAllPrescriptions(): Promise<PrescriptionDocument[]> {
    const snap = await getDocs(collection(db, 'prescriptions'));
    
    return snap.docs.map((d) => normalizePrescription(d) as unknown as PrescriptionDocument);
  }

  static async getInventory(hospitalId: string): Promise<InventoryItem[]> {
    await this.ensureSeededData(hospitalId);

    const q = query(
      collection(db, 'inventory'),
      where('hospitalId', '==', hospitalId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as InventoryItem);
  }

  static async addInventoryItem(
    hospitalId: string,
    data: Omit<InventoryItem, 'inventoryId' | 'hospitalId'>
  ): Promise<InventoryItem> {
    const inventoryId = `inv_${hospitalId}_${Date.now()}`;
    const newItem: InventoryItem = {
      ...data,
      inventoryId,
      hospitalId,
      createdAt: new Date().toISOString(),
    };

    validateDoc(inventoryItemSchema, newItem);

    await setDoc(doc(db, 'inventory', inventoryId), newItem);
    return newItem;
  }

  static async updateInventoryItem(
    inventoryId: string,
    data: Partial<Omit<InventoryItem, 'inventoryId' | 'hospitalId'>>
  ): Promise<void> {
    const docRef = doc(db, 'inventory', inventoryId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Inventory item not found.');
    }
    const currentItem = docSnap.data() as InventoryItem;
    const updatedItem = {
      ...currentItem,
      ...data,
    };

    validateDoc(inventoryItemSchema, updatedItem);

    await updateDoc(docRef, data);
  }

  static async deleteInventoryItem(inventoryId: string): Promise<void> {
    const docRef = doc(db, 'inventory', inventoryId);
    await deleteDoc(docRef);
  }

  static async dispenseMedicine(
    recordId: string,
    patientId: string,
    patientName: string,
    hospitalId: string,
    dispensedBy: string,
    medicinesToDispense: Array<{ medicineId: string; quantity: number }>
  ): Promise<void> {
    // 1. Fetch inventory items first to retrieve document IDs
    const inventoriesQ = query(
      collection(db, 'inventory'),
      where('hospitalId', '==', hospitalId)
    );
    const snap = await getDocs(inventoriesQ);
    const inventoryList = snap.docs.map((d) => d.data() as InventoryItem);

    // 2. Perform validation and updates atomically within a transaction to prevent race conditions
    await runTransaction(db, async (transaction) => {
      const currentInventoryDocs = [];

      for (const item of medicinesToDispense) {
        const invItem = inventoryList.find((inv) => inv.medicineId === item.medicineId);
        if (!invItem) {
          throw new Error(`Medicine not found in inventory.`);
        }

        const invRef = doc(db, 'inventory', invItem.inventoryId);
        const invSnap = await transaction.get(invRef);
        if (!invSnap.exists()) {
          throw new Error(`Inventory record for ${invItem.medicineName} not found.`);
        }

        const invData = invSnap.data() as InventoryItem;
        if (invData.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${invData.medicineName}. Requested: ${item.quantity}, Available: ${invData.quantity}`);
        }

        currentInventoryDocs.push({
          ref: invRef,
          currentQty: invData.quantity,
          dispenseQty: item.quantity,
          name: invData.medicineName,
          medicineId: item.medicineId,
        });
      }

      // Perform all mutations after all gets/reads are complete
      for (const docInfo of currentInventoryDocs) {
        transaction.update(docInfo.ref, {
          quantity: docInfo.currentQty - docInfo.dispenseQty,
        });
      }

      // Write dispensation log
      const dispenseId = `disp_${Date.now()}`;
      const logRef = doc(db, 'dispensation_logs', dispenseId);

      const log: DispensationLog = {
        dispenseId,
        recordId,
        patientId,
        patientName,
        hospitalId,
        medicines: currentInventoryDocs.map((docInfo) => ({
          medicineId: docInfo.medicineId,
          name: docInfo.name,
          quantity: docInfo.dispenseQty,
        })),
        dispensedAt: new Date().toISOString(),
        dispensedBy,
      };

      transaction.set(logRef, log);
    });
  }

  static async getDispenseHistory(hospitalId: string): Promise<DispensationLog[]> {
    const q = query(
      collection(db, 'dispensation_logs'),
      where('hospitalId', '==', hospitalId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DispensationLog);
  }

  static async ensureSeededData(hospitalId: string): Promise<void> {
    const q = query(
      collection(db, 'inventory'),
      where('hospitalId', '==', hospitalId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      const batch = writeBatch(db);
      const today = new Date();
      
      const seedItems = [
        { name: 'Paracetamol 650mg', category: 'Analgesics', qty: 1500, minStock: 200, shelfDays: 400, supplier: 'Astra Biotech', batch: 'PRC-998' },
        { name: 'Amoxicillin 500mg', category: 'Antibiotics', qty: 85, minStock: 100, shelfDays: 350, supplier: 'Medipharma Labs', batch: 'AMX-442' },
        { name: 'Atorvastatin 10mg', category: 'Cardiovascular', qty: 500, minStock: 150, shelfDays: 12, supplier: 'CardioPharma', batch: 'ATR-201' }, // Expiring soon
        { name: 'Metformin 500mg', category: 'Antidiabetics', qty: 0, minStock: 300, shelfDays: 200, supplier: 'Glucocare Ltd', batch: 'MTF-509' }, // Out of stock
        { name: 'Pantoprazole 40mg', category: 'Gastrointestinal', qty: 1200, minStock: 250, shelfDays: 500, supplier: 'Zydus Health', batch: 'PAN-105' },
        { name: 'Azithromycin 500mg', category: 'Antibiotics', qty: 10, minStock: 50, shelfDays: -5, supplier: 'Astra Biotech', batch: 'AZT-809' }, // Expired & low stock
        { name: 'Ibuprofen 400mg', category: 'Analgesics', qty: 450, minStock: 100, shelfDays: 450, supplier: 'Cipla Diagnostics', batch: 'IBU-312' },
        { name: 'Insulin Glargine 100 IU', category: 'Antidiabetics', qty: 90, minStock: 50, shelfDays: 9, supplier: 'Novo Healthcare', batch: 'INS-004' }, // Expiring soon
      ];

      for (let i = 0; i < seedItems.length; i++) {
        const item = seedItems[i];
        const medId = `med_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const invId = `inv_${hospitalId}_${medId}`;

        // Calculate expiry date
        const expDate = new Date();
        expDate.setDate(today.getDate() + item.shelfDays);
        const expDateStr = expDate.toISOString().split('T')[0];

        const invDoc: InventoryItem = {
          inventoryId: invId,
          hospitalId,
          medicineId: medId,
          medicineName: item.name,
          category: item.category,
          quantity: item.qty,
          minimumStock: item.minStock,
          batchNumber: item.batch,
          expiryDate: expDateStr,
          supplier: item.supplier,
          status: 'active',
        };

        validateDoc(inventoryItemSchema, invDoc);

        batch.set(doc(db, 'inventory', invId), invDoc);
      }

      // Seed a few initial dispense history records
      const logs = [
        {
          dispenseId: `disp_seeded_1`,
          recordId: 'pres_seeded_101',
          patientId: 'pat_rohan_arav',
          patientName: 'Rohan Sharma',
          medicines: [
            { medicineId: 'med_paracetamol_650mg', name: 'Paracetamol 650mg', quantity: 10 },
            { medicineId: 'med_pantoprazole_40mg', name: 'Pantoprazole 40mg', quantity: 5 },
          ],
          dispensedAt: new Date(today.getTime() - 2 * 3600000).toISOString(),
          dispensedBy: 'pharmacist_user_1',
        },
        {
          dispenseId: `disp_seeded_2`,
          recordId: 'pres_seeded_102',
          patientId: 'pat_priya_arav',
          patientName: 'Priya Patel',
          medicines: [
            { medicineId: 'med_pantoprazole_40mg', name: 'Pantoprazole 40mg', quantity: 14 },
          ],
          dispensedAt: new Date(today.getTime() - 24 * 3600000).toISOString(),
          dispensedBy: 'pharmacist_user_1',
        },
      ];

      for (const log of logs) {
        batch.set(doc(db, 'dispensation_logs', log.dispenseId), {
          ...log,
          hospitalId,
        });
      }

      await batch.commit();
    }
  }
}
export default PharmacyService;
