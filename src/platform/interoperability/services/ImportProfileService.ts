import { ImportProfile } from '../types';
import { ImportProfileRepository } from '../repositories';
export class ImportProfileService {
  constructor(private readonly repo: ImportProfileRepository) {}
  async manageImportProfileMetadata(item: Partial<ImportProfile>): Promise<ImportProfile> { throw new Error('Not implemented'); }
}
