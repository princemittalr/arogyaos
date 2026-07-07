import { ReferenceDataVersion } from '../types';

export class ReferenceDataVersionRepository {
  private static instance: ReferenceDataVersionRepository;
  private data: Map<string, ReferenceDataVersion> = new Map();

  private constructor() {}

  public static getInstance(): ReferenceDataVersionRepository {
    if (!ReferenceDataVersionRepository.instance) {
      ReferenceDataVersionRepository.instance = new ReferenceDataVersionRepository();
    }
    return ReferenceDataVersionRepository.instance;
  }

  public async save(entity: ReferenceDataVersion): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ReferenceDataVersion | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ReferenceDataVersion[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
