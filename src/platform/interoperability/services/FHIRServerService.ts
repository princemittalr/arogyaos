import { FHIRServer } from '../types';
import { FHIRServerRepository } from '../repositories';
export class FHIRServerService {
  constructor(private readonly repo: FHIRServerRepository) {}
  async manageFHIRServerMetadata(item: Partial<FHIRServer>): Promise<FHIRServer> { throw new Error('Not implemented'); }
}
