import { FHIRTerminology } from '../types';
import { FHIRTerminologyRepository } from '../repositories';
export class FHIRTerminologyService {
  constructor(private readonly repo: FHIRTerminologyRepository) {}
  async manageFHIRTerminologyMetadata(item: Partial<FHIRTerminology>): Promise<FHIRTerminology> { throw new Error('Not implemented'); }
}
