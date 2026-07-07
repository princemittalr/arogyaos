import { AIAgent } from '../types';
import { AIAgentRepository } from '../repositories';
export class AIAgentService {
  constructor(private readonly repo: AIAgentRepository) {}
  async manageAgentMetadata(item: Partial<AIAgent>): Promise<AIAgent> { throw new Error('Not implemented'); }
}
