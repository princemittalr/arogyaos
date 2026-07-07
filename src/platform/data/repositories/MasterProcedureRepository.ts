import { MasterProcedure } from '../types';

export class MasterProcedureRepository {
  private static instance: MasterProcedureRepository;
  private data: Map<string, MasterProcedure> = new Map();

  private constructor() {}

  public static getInstance(): MasterProcedureRepository {
    if (!MasterProcedureRepository.instance) {
      MasterProcedureRepository.instance = new MasterProcedureRepository();
    }
    return MasterProcedureRepository.instance;
  }

  public async save(entity: MasterProcedure): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterProcedure | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterProcedure[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
