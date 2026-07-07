import { FHIRStructureDefinition } from '../types';
import { FHIRStructureDefinitionRepository } from '../repositories';
export class FHIRStructureDefinitionService {
  constructor(private readonly repo: FHIRStructureDefinitionRepository) {}
  async manageFHIRStructureDefinitionMetadata(item: Partial<FHIRStructureDefinition>): Promise<FHIRStructureDefinition> { throw new Error('Not implemented'); }
}
