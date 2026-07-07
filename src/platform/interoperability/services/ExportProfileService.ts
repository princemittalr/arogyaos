import { ExportProfile } from '../types';
import { ExportProfileRepository } from '../repositories';
export class ExportProfileService {
  constructor(private readonly repo: ExportProfileRepository) {}
  async manageExportProfileMetadata(item: Partial<ExportProfile>): Promise<ExportProfile> { throw new Error('Not implemented'); }
}
