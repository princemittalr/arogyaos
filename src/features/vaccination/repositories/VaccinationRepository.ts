import { BaseRepository } from '@/features/health-vault/repositories/BaseRepository';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VaccinationRecord } from '../types';

export class VaccinationRepository extends BaseRepository<VaccinationRecord> {
  private readonly colRef = collection(db, 'vaccination_records');

  constructor() {
    super('vaccination_records');
  }

  public async getByPatientId(patientId: string): Promise<VaccinationRecord[]> {
    const q = query(this.colRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccinationRecord);
  }

  public async getByFacilityId(facilityId: string): Promise<VaccinationRecord[]> {
    const q = query(this.colRef, where('facilityId', '==', facilityId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccinationRecord);
  }
}
