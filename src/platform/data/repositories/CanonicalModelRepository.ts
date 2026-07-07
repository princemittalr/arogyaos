import { CanonicalModel } from '../types';

export class CanonicalModelRepository {
  private static instance: CanonicalModelRepository;
  private data: Map<string, CanonicalModel> = new Map();

  private constructor() {}

  public static getInstance(): CanonicalModelRepository {
    if (!CanonicalModelRepository.instance) {
      CanonicalModelRepository.instance = new CanonicalModelRepository();
    }
    return CanonicalModelRepository.instance;
  }

  public async save(entity: CanonicalModel): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<CanonicalModel | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<CanonicalModel[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
