import { DecisionTree } from '../types';
import { DecisionTreeRepository } from '../repositories';
export class DecisionTreeService {
  constructor(private readonly repo: DecisionTreeRepository) {}
  async manageDecisionTreeMetadata(item: Partial<DecisionTree>): Promise<DecisionTree> { throw new Error('Not implemented'); }
}
