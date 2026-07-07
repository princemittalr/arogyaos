import { MasterFacility } from '../types';

export class MasterFacilityRepository {
  private static instance: MasterFacilityRepository;
  private data: Map<string, MasterFacility> = new Map();

  private constructor() {}

  public static getInstance(): MasterFacilityRepository {
    if (!MasterFacilityRepository.instance) {
      MasterFacilityRepository.instance = new MasterFacilityRepository();
    }
    return MasterFacilityRepository.instance;
  }

  public async save(entity: MasterFacility): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterFacility | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterFacility[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
