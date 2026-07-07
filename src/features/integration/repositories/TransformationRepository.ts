import { TransformationRule } from '../types';

export class TransformationRepository {
  async save(rule: TransformationRule): Promise<TransformationRule> {
    throw new Error('Not implemented');
  }

  async findByIntegrationId(integrationId: string): Promise<TransformationRule[]> {
    throw new Error('Not implemented');
  }
}
