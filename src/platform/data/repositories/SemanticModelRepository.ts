import { SemanticModel } from '../types';

export class SemanticModelRepository {
  private static instance: SemanticModelRepository;
  private data: Map<string, SemanticModel> = new Map();

  private constructor() {}

  public static getInstance(): SemanticModelRepository {
    if (!SemanticModelRepository.instance) {
      SemanticModelRepository.instance = new SemanticModelRepository();
    }
    return SemanticModelRepository.instance;
  }

  public async save(entity: SemanticModel): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<SemanticModel | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<SemanticModel[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
