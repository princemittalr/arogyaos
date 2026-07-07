import { MasterDevice } from '../types';

export class MasterDeviceRepository {
  private static instance: MasterDeviceRepository;
  private data: Map<string, MasterDevice> = new Map();

  private constructor() {}

  public static getInstance(): MasterDeviceRepository {
    if (!MasterDeviceRepository.instance) {
      MasterDeviceRepository.instance = new MasterDeviceRepository();
    }
    return MasterDeviceRepository.instance;
  }

  public async save(entity: MasterDevice): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterDevice | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterDevice[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
