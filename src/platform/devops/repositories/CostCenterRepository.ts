import { CostCenter } from '../types';

export class CostCenterRepository {
  private static instance: CostCenterRepository;
  private data: Map<string, CostCenter> = new Map();

  private constructor() {}

  public static getInstance(): CostCenterRepository {
    if (!CostCenterRepository.instance) {
      CostCenterRepository.instance = new CostCenterRepository();
    }
    return CostCenterRepository.instance;
  }

  public async save(entity: CostCenter): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<CostCenter | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<CostCenter[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
