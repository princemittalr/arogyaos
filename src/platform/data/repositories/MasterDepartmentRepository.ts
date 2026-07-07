import { MasterDepartment } from '../types';

export class MasterDepartmentRepository {
  private static instance: MasterDepartmentRepository;
  private data: Map<string, MasterDepartment> = new Map();

  private constructor() {}

  public static getInstance(): MasterDepartmentRepository {
    if (!MasterDepartmentRepository.instance) {
      MasterDepartmentRepository.instance = new MasterDepartmentRepository();
    }
    return MasterDepartmentRepository.instance;
  }

  public async save(entity: MasterDepartment): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterDepartment | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterDepartment[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
