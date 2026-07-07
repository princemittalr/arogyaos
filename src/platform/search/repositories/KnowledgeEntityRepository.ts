import { KnowledgeEntity } from '../types';

export class KnowledgeEntityRepository {
  async save(entity: KnowledgeEntity): Promise<KnowledgeEntity> {
    throw new Error('Not implemented');
  }
}
