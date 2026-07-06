import { BaseRepository } from './BaseRepository';
import { ConsultationRecord } from '../types';

export class ConsultationRepository extends BaseRepository<ConsultationRecord> {
  constructor() {
    super('consultations');
  }
}
export default ConsultationRepository;
