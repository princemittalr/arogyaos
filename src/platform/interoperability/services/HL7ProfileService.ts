import { HL7Profile } from '../types';
import { HL7ProfileRepository } from '../repositories';
export class HL7ProfileService {
  constructor(private readonly repo: HL7ProfileRepository) {}
  async manageHL7ProfileMetadata(item: Partial<HL7Profile>): Promise<HL7Profile> { throw new Error('Not implemented'); }
}
