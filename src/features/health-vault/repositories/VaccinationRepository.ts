import { BaseRepository } from './BaseRepository';
import { VaccinationRecord } from '../types';

export class VaccinationRepository extends BaseRepository<VaccinationRecord> {
  constructor() {
    super('vaccinations');
  }
}
export default VaccinationRepository;
