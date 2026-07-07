import { db } from '@/firebase/client';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { VaccinationSchedule } from '../types';

export class ScheduleRepository {
  private colRef = collection(db, 'vaccination_schedules');

  public async getById(scheduleId: string): Promise<VaccinationSchedule | null> {
    const docRef = doc(db, 'vaccination_schedules', scheduleId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as VaccinationSchedule;
  }

  public async getByPatientId(patientId: string): Promise<VaccinationSchedule[]> {
    const q = query(this.colRef, where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccinationSchedule);
  }

  public async create(schedule: VaccinationSchedule): Promise<void> {
    const docRef = doc(db, 'vaccination_schedules', schedule.scheduleId);
    await setDoc(docRef, schedule);
  }

  public async update(scheduleId: string, data: Partial<VaccinationSchedule>): Promise<void> {
    const docRef = doc(db, 'vaccination_schedules', scheduleId);
    await updateDoc(docRef, data);
  }

  public async delete(scheduleId: string): Promise<void> {
    const docRef = doc(db, 'vaccination_schedules', scheduleId);
    await deleteDoc(docRef);
  }
}
