import { SemanticModel } from '../types';
import { SemanticModelRepository } from '../repositories/SemanticModelRepository';

export class SemanticModelService {
  private static instance: SemanticModelService;
  private repo = SemanticModelRepository.getInstance();

  private constructor() {}

  public static getInstance(): SemanticModelService {
    if (!SemanticModelService.instance) {
      SemanticModelService.instance = new SemanticModelService();
    }
    return SemanticModelService.instance;
  }

  public async create(data: SemanticModel): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<SemanticModel | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<SemanticModel[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
