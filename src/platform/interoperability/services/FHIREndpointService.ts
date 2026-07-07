import { FHIREndpoint } from '../types';
import { FHIREndpointRepository } from '../repositories';
export class FHIREndpointService {
  constructor(private readonly repo: FHIREndpointRepository) {}
  async manageFHIREndpointMetadata(item: Partial<FHIREndpoint>): Promise<FHIREndpoint> { throw new Error('Not implemented'); }
}
