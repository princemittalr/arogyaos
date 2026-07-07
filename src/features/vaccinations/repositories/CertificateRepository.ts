import { db } from '@/firebase/client';
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { VaccinationCertificate } from '../types';

export class CertificateRepository {
  private colRef = collection(db, 'vaccination_certificates');

  public async getById(certificateId: string): Promise<VaccinationCertificate | null> {
    const docRef = doc(db, 'vaccination_certificates', certificateId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as VaccinationCertificate;
  }

  public async getByPatientId(patientId: string): Promise<VaccinationCertificate[]> {
    const q = query(this.colRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccinationCertificate);
  }

  public async getByVaccinationId(vaccinationId: string): Promise<VaccinationCertificate | null> {
    const q = query(this.colRef, where('vaccinationId', '==', vaccinationId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as VaccinationCertificate;
  }

  public async create(certificate: VaccinationCertificate): Promise<void> {
    const docRef = doc(db, 'vaccination_certificates', certificate.certificateId);
    await setDoc(docRef, certificate);
  }
}
