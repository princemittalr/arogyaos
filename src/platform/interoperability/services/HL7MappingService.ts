import { HL7Mapping } from '../types';
import { HL7MappingRepository } from '../repositories';
export class HL7MappingService {
  constructor(private readonly repo: HL7MappingRepository) {}
  async manageHL7MappingMetadata(item: Partial<HL7Mapping>): Promise<HL7Mapping> { throw new Error('Not implemented'); }
}
