import { DataAudit } from '../types';

export class DataAuditRepository {
  private static instance: DataAuditRepository;
  private data: Map<string, DataAudit> = new Map();

  private constructor() {}

  public static getInstance(): DataAuditRepository {
    if (!DataAuditRepository.instance) {
      DataAuditRepository.instance = new DataAuditRepository();
    }
    return DataAuditRepository.instance;
  }

  public async save(entity: DataAudit): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<DataAudit | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<DataAudit[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
