import { ComplianceFramework } from '../types';
import { ComplianceFrameworkRepository } from '../repositories';

export class ComplianceFrameworkService {
  constructor(private readonly frameworkRepo: ComplianceFrameworkRepository) {}

  async manageFrameworkMetadata(framework: Partial<ComplianceFramework>): Promise<ComplianceFramework> {
    throw new Error('Not implemented');
  }
}
