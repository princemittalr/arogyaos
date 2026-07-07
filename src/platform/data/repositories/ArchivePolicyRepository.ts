import { ArchivePolicy } from '../types';

export class ArchivePolicyRepository {
  private static instance: ArchivePolicyRepository;
  private data: Map<string, ArchivePolicy> = new Map();

  private constructor() {}

  public static getInstance(): ArchivePolicyRepository {
    if (!ArchivePolicyRepository.instance) {
      ArchivePolicyRepository.instance = new ArchivePolicyRepository();
    }
    return ArchivePolicyRepository.instance;
  }

  public async save(entity: ArchivePolicy): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ArchivePolicy | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ArchivePolicy[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
