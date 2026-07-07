import { BackupPolicy } from '../types';

export class BackupPolicyRepository {
  private static instance: BackupPolicyRepository;
  private data: Map<string, BackupPolicy> = new Map();

  private constructor() {}

  public static getInstance(): BackupPolicyRepository {
    if (!BackupPolicyRepository.instance) {
      BackupPolicyRepository.instance = new BackupPolicyRepository();
    }
    return BackupPolicyRepository.instance;
  }

  public async save(entity: BackupPolicy): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<BackupPolicy | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<BackupPolicy[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
