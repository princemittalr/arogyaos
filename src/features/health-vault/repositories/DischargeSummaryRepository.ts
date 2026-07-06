import { BaseRepository } from './BaseRepository';
import { DischargeSummaryRecord } from '../types';

export class DischargeSummaryRepository extends BaseRepository<DischargeSummaryRecord> {
  constructor() {
    super('discharge_summaries');
  }
}
export default DischargeSummaryRepository;
