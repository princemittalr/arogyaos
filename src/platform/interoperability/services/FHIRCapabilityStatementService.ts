import { FHIRCapabilityStatement } from '../types';
import { FHIRCapabilityStatementRepository } from '../repositories';
export class FHIRCapabilityStatementService {
  constructor(private readonly repo: FHIRCapabilityStatementRepository) {}
  async manageFHIRCapabilityStatementMetadata(item: Partial<FHIRCapabilityStatement>): Promise<FHIRCapabilityStatement> { throw new Error('Not implemented'); }
}
