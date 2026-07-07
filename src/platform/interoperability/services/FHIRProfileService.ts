import { FHIRProfile } from '../types';
import { FHIRProfileRepository } from '../repositories';
export class FHIRProfileService {
  constructor(private readonly repo: FHIRProfileRepository) {}
  async manageFHIRProfileMetadata(item: Partial<FHIRProfile>): Promise<FHIRProfile> { throw new Error('Not implemented'); }
}
