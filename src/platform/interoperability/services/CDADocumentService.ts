import { CDADocument } from '../types';
import { CDADocumentRepository } from '../repositories';
export class CDADocumentService {
  constructor(private readonly repo: CDADocumentRepository) {}
  async manageCDADocumentMetadata(item: Partial<CDADocument>): Promise<CDADocument> { throw new Error('Not implemented'); }
}
