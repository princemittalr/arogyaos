import { BaseRepository } from './BaseRepository';
import { LabReportRecord } from '../types';

export class LabRepository extends BaseRepository<LabReportRecord> {
  constructor() {
    super('lab_reports');
  }
}
export default LabRepository;
