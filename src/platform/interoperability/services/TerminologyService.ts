import { TerminologyService as TerminologyType } from '../types';
import { TerminologyRepository } from '../repositories';
export class TerminologyService {
  constructor(private readonly repo: TerminologyRepository) {}
  async manageTerminologyMetadata(item: Partial<TerminologyType>): Promise<TerminologyType> { throw new Error('Not implemented'); }
}
