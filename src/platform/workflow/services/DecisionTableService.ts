import { DecisionTable } from '../types';
import { DecisionTableRepository } from '../repositories';
export class DecisionTableService {
  constructor(private readonly repo: DecisionTableRepository) {}
  async manageDecisionTable(item: Partial<DecisionTable>): Promise<DecisionTable> { throw new Error('Not implemented'); }
}
