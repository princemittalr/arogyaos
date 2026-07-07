import { MasterProvider } from '../types';

export class MasterProviderRepository {
  private static instance: MasterProviderRepository;
  private data: Map<string, MasterProvider> = new Map();

  private constructor() {}

  public static getInstance(): MasterProviderRepository {
    if (!MasterProviderRepository.instance) {
      MasterProviderRepository.instance = new MasterProviderRepository();
    }
    return MasterProviderRepository.instance;
  }

  public async save(entity: MasterProvider): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterProvider | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterProvider[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
