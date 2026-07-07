import { Release } from '../types';

export class ReleaseRepository {
  private static instance: ReleaseRepository;
  private data: Map<string, Release> = new Map();

  private constructor() {}

  public static getInstance(): ReleaseRepository {
    if (!ReleaseRepository.instance) {
      ReleaseRepository.instance = new ReleaseRepository();
    }
    return ReleaseRepository.instance;
  }

  public async save(entity: Release): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Release | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Release[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
