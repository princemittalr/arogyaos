import { FHIRResource } from '../types';
import { FHIRResourceRepository } from '../repositories';
export class FHIRResourceService {
  constructor(private readonly repo: FHIRResourceRepository) {}
  async manageFHIRResourceMetadata(item: Partial<FHIRResource>): Promise<FHIRResource> { throw new Error('Not implemented'); }
}
