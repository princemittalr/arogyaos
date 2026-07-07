import { MasterPatientIndex } from '../types';
import { MasterPatientIndexRepository } from '../repositories';
export class MasterPatientIndexService {
  constructor(private readonly repo: MasterPatientIndexRepository) {}
  async manageMPIMetadata(item: Partial<MasterPatientIndex>): Promise<MasterPatientIndex> { throw new Error('Not implemented'); }
}
