import { ValidationProfile } from '../types';
import { ValidationProfileRepository } from '../repositories';
export class ValidationProfileService {
  constructor(private readonly repo: ValidationProfileRepository) {}
  async manageValidationProfileMetadata(item: Partial<ValidationProfile>): Promise<ValidationProfile> { throw new Error('Not implemented'); }
}
