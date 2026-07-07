import { ReferenceDataSet } from '../types';

export class ReferenceDataSetRepository {
  private static instance: ReferenceDataSetRepository;
  private data: Map<string, ReferenceDataSet> = new Map();

  private constructor() {}

  public static getInstance(): ReferenceDataSetRepository {
    if (!ReferenceDataSetRepository.instance) {
      ReferenceDataSetRepository.instance = new ReferenceDataSetRepository();
    }
    return ReferenceDataSetRepository.instance;
  }

  public async save(entity: ReferenceDataSet): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ReferenceDataSet | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ReferenceDataSet[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
