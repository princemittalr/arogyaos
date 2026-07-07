import { KnowledgeRelationship } from '../types';

export class KnowledgeRelationshipRepository {
  async save(relationship: KnowledgeRelationship): Promise<KnowledgeRelationship> {
    throw new Error('Not implemented');
  }
}
