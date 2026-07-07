import { FHIRCodeSystem } from '../types';
import { FHIRCodeSystemRepository } from '../repositories';
export class FHIRCodeSystemService {
  constructor(private readonly repo: FHIRCodeSystemRepository) {}
  async manageFHIRCodeSystemMetadata(item: Partial<FHIRCodeSystem>): Promise<FHIRCodeSystem> { throw new Error('Not implemented'); }
}
