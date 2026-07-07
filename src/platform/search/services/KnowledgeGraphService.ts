import { KnowledgeGraph } from '../types';
import { KnowledgeGraphRepository } from '../repositories';

export class KnowledgeGraphService {
  constructor(private readonly graphRepo: KnowledgeGraphRepository) {}

  async manageGraphMetadata(graph: Partial<KnowledgeGraph>): Promise<KnowledgeGraph> {
    throw new Error('Not implemented');
  }
}
