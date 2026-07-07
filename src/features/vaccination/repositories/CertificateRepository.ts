import { BaseRepository } from '@/features/health-vault/repositories/BaseRepository';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { VaccineCertificate } from '../types';

export class CertificateRepository extends BaseRepository<VaccineCertificate> {
  private readonly colRef = collection(db, 'vaccination_certificates');

  constructor() {
    super('vaccination_certificates');
  }

  public async getByPatientId(patientId: string): Promise<VaccineCertificate[]> {
    const q = query(this.colRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccineCertificate);
  }

  public async getByVaccinationId(
    vaccinationId: string,
  ): Promise<VaccineCertificate | null> {
    const q = query(this.colRef, where('vaccinationId', '==', vaccinationId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as VaccineCertificate;
  }
}
