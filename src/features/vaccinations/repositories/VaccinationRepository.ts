import { db } from '@/firebase/client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { Vaccination } from '../types';

export class VaccinationRepository {
  private colRef = collection(db, 'vaccinations');

  public async getById(vaccinationId: string): Promise<Vaccination | null> {
    const docRef = doc(db, 'vaccinations', vaccinationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Vaccination;
  }

  public async getByPatientId(patientId: string): Promise<Vaccination[]> {
    const q = query(this.colRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Vaccination);
  }

  public async getByHospitalId(hospitalId: string): Promise<Vaccination[]> {
    const q = query(this.colRef, where('hospitalId', '==', hospitalId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Vaccination);
  }

  public async create(vaccination: Vaccination): Promise<void> {
    const docRef = doc(db, 'vaccinations', vaccination.vaccinationId);
    await setDoc(docRef, vaccination);
  }

  public async update(vaccinationId: string, data: Partial<Vaccination>): Promise<void> {
    const docRef = doc(db, 'vaccinations', vaccinationId);
    await updateDoc(docRef, data);
  }
}
