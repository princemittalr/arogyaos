import { FHIRBundle } from '../types';
import { FHIRBundleRepository } from '../repositories';
export class FHIRBundleService {
  constructor(private readonly repo: FHIRBundleRepository) {}
  async manageFHIRBundleMetadata(item: Partial<FHIRBundle>): Promise<FHIRBundle> { throw new Error('Not implemented'); }
}
