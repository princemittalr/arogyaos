import { MasterStaff } from '../types';

export class MasterStaffRepository {
  private static instance: MasterStaffRepository;
  private data: Map<string, MasterStaff> = new Map();

  private constructor() {}

  public static getInstance(): MasterStaffRepository {
    if (!MasterStaffRepository.instance) {
      MasterStaffRepository.instance = new MasterStaffRepository();
    }
    return MasterStaffRepository.instance;
  }

  public async save(entity: MasterStaff): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterStaff | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterStaff[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
