import { MasterPatient } from '../types';

export class MasterPatientRepository {
  private static instance: MasterPatientRepository;
  private data: Map<string, MasterPatient> = new Map();

  private constructor() {}

  public static getInstance(): MasterPatientRepository {
    if (!MasterPatientRepository.instance) {
      MasterPatientRepository.instance = new MasterPatientRepository();
    }
    return MasterPatientRepository.instance;
  }

  public async save(entity: MasterPatient): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterPatient | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterPatient[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
