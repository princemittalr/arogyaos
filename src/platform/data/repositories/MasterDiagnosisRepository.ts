import { MasterDiagnosis } from '../types';

export class MasterDiagnosisRepository {
  private static instance: MasterDiagnosisRepository;
  private data: Map<string, MasterDiagnosis> = new Map();

  private constructor() {}

  public static getInstance(): MasterDiagnosisRepository {
    if (!MasterDiagnosisRepository.instance) {
      MasterDiagnosisRepository.instance = new MasterDiagnosisRepository();
    }
    return MasterDiagnosisRepository.instance;
  }

  public async save(entity: MasterDiagnosis): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterDiagnosis | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterDiagnosis[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
