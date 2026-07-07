import { CrossModuleReference } from '../types';

export class CrossModuleReferenceRepository {
  async save(reference: CrossModuleReference): Promise<CrossModuleReference> {
    throw new Error('Not implemented');
  }
}
