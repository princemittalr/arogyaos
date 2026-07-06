import { BaseRepository } from './BaseRepository';
import { RadiologyReportRecord } from '../types/radiology';

export class RadiologyRepository extends BaseRepository<RadiologyReportRecord> {
  constructor() {
    super('radiology_reports');
  }
}
export default RadiologyRepository;
