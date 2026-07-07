import { MasterOrganization } from '../types';

export class MasterOrganizationRepository {
  private static instance: MasterOrganizationRepository;
  private data: Map<string, MasterOrganization> = new Map();

  private constructor() {}

  public static getInstance(): MasterOrganizationRepository {
    if (!MasterOrganizationRepository.instance) {
      MasterOrganizationRepository.instance = new MasterOrganizationRepository();
    }
    return MasterOrganizationRepository.instance;
  }

  public async save(entity: MasterOrganization): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterOrganization | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterOrganization[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
