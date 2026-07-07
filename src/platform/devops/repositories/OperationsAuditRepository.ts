import { OperationsAudit } from '../types';

export class OperationsAuditRepository {
  private static instance: OperationsAuditRepository;
  private data: Map<string, OperationsAudit> = new Map();

  private constructor() {}

  public static getInstance(): OperationsAuditRepository {
    if (!OperationsAuditRepository.instance) {
      OperationsAuditRepository.instance = new OperationsAuditRepository();
    }
    return OperationsAuditRepository.instance;
  }

  public async save(entity: OperationsAudit): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<OperationsAudit | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<OperationsAudit[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
