import { BaseRepository } from './BaseRepository';
import { PrescriptionRecord } from '../types';

export class PrescriptionRepository extends BaseRepository<PrescriptionRecord> {
  constructor() {
    super('prescriptions');
  }
}
export default PrescriptionRepository;
