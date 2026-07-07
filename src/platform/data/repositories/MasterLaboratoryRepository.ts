import { MasterLaboratory } from '../types';

export class MasterLaboratoryRepository {
  private static instance: MasterLaboratoryRepository;
  private data: Map<string, MasterLaboratory> = new Map();

  private constructor() {}

  public static getInstance(): MasterLaboratoryRepository {
    if (!MasterLaboratoryRepository.instance) {
      MasterLaboratoryRepository.instance = new MasterLaboratoryRepository();
    }
    return MasterLaboratoryRepository.instance;
  }

  public async save(entity: MasterLaboratory): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterLaboratory | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterLaboratory[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
