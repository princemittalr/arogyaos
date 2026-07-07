import { PromptTemplate } from '../types';
import { PromptTemplateRepository } from '../repositories';
export class PromptTemplateService {
  constructor(private readonly repo: PromptTemplateRepository) {}
  async managePromptTemplateMetadata(item: Partial<PromptTemplate>): Promise<PromptTemplate> { throw new Error('Not implemented'); }
}
