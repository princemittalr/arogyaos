import { FHIRValueSet } from '../types';
import { FHIRValueSetRepository } from '../repositories';
export class FHIRValueSetService {
  constructor(private readonly repo: FHIRValueSetRepository) {}
  async manageFHIRValueSetMetadata(item: Partial<FHIRValueSet>): Promise<FHIRValueSet> { throw new Error('Not implemented'); }
}
