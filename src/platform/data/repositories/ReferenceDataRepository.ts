import { ReferenceData } from '../types';

export class ReferenceDataRepository {
  private static instance: ReferenceDataRepository;
  private data: Map<string, ReferenceData> = new Map();

  private constructor() {}

  public static getInstance(): ReferenceDataRepository {
    if (!ReferenceDataRepository.instance) {
      ReferenceDataRepository.instance = new ReferenceDataRepository();
    }
    return ReferenceDataRepository.instance;
  }

  public async save(entity: ReferenceData): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ReferenceData | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ReferenceData[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
