import { KnowledgeBaseEntry, KnowledgeBaseVersion } from '../types';

export class KnowledgeBaseRepository {
  async findEntryById(id: string): Promise<KnowledgeBaseEntry | null> {
    throw new Error('Not implemented');
  }

  async findEntriesByTopic(topic: string): Promise<KnowledgeBaseEntry[]> {
    throw new Error('Not implemented');
  }

  async saveEntry(entry: KnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    throw new Error('Not implemented');
  }

  async saveVersion(version: KnowledgeBaseVersion): Promise<KnowledgeBaseVersion> {
    throw new Error('Not implemented');
  }
}
