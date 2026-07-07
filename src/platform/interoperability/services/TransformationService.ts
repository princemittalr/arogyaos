import { DataTransformation } from '../types';
import { TransformationRepository } from '../repositories';
export class TransformationService {
  constructor(private readonly repo: TransformationRepository) {}
  async manageTransformationMetadata(item: Partial<DataTransformation>): Promise<DataTransformation> { throw new Error('Not implemented'); }
}
