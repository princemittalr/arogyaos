import { normalizePrescription } from '@/features/prescriptions/utils/normalizePrescription';
import { BaseRepository } from './BaseRepository';
import { PrescriptionRecord } from '../types';

export class PrescriptionRepository extends BaseRepository<PrescriptionRecord> {
  constructor() {
    super('prescriptions');
  }
  public async getById(id: string, transaction?: import('firebase/firestore').Transaction): Promise<PrescriptionRecord | null> {
    const result = await super.getById(id, transaction);
    if (!result) return null;
    
    return normalizePrescription(result) as unknown as PrescriptionRecord;
  }

  public async getVersion(recordId: string, versionNumber: number, transaction?: import('firebase/firestore').Transaction): Promise<PrescriptionRecord | null> {
    const result = await super.getVersion(recordId, versionNumber, transaction);
    if (!result) return null;
    
    return normalizePrescription(result) as unknown as PrescriptionRecord;
  }
}
export default PrescriptionRepository;
