import { FHIRImplementationGuide } from '../types';
import { FHIRImplementationGuideRepository } from '../repositories';
export class FHIRImplementationGuideService {
  constructor(private readonly repo: FHIRImplementationGuideRepository) {}
  async manageFHIRImplementationGuideMetadata(item: Partial<FHIRImplementationGuide>): Promise<FHIRImplementationGuide> { throw new Error('Not implemented'); }
}
