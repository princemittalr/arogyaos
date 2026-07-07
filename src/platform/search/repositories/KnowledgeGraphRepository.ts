import { KnowledgeGraph } from '../types';

export class KnowledgeGraphRepository {
  async save(graph: KnowledgeGraph): Promise<KnowledgeGraph> {
    throw new Error('Not implemented');
  }
}
