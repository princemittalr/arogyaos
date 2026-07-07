import { MappingProfile } from '../types';
import { MappingProfileRepository } from '../repositories';
export class MappingProfileService {
  constructor(private readonly repo: MappingProfileRepository) {}
  async manageMappingProfileMetadata(item: Partial<MappingProfile>): Promise<MappingProfile> { throw new Error('Not implemented'); }
}
