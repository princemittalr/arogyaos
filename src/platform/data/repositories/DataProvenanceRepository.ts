import { DataProvenance } from '../types';

export class DataProvenanceRepository {
  private static instance: DataProvenanceRepository;
  private data: Map<string, DataProvenance> = new Map();

  private constructor() {}

  public static getInstance(): DataProvenanceRepository {
    if (!DataProvenanceRepository.instance) {
      DataProvenanceRepository.instance = new DataProvenanceRepository();
    }
    return DataProvenanceRepository.instance;
  }

  public async save(entity: DataProvenance): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataProvenance | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataProvenance[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
