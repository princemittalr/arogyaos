import { ClinicalTerminology } from '../types';

export class ClinicalTerminologyRepository {
  private static instance: ClinicalTerminologyRepository;
  private data: Map<string, ClinicalTerminology> = new Map();

  private constructor() {}

  public static getInstance(): ClinicalTerminologyRepository {
    if (!ClinicalTerminologyRepository.instance) {
      ClinicalTerminologyRepository.instance = new ClinicalTerminologyRepository();
    }
    return ClinicalTerminologyRepository.instance;
  }

  public async save(entity: ClinicalTerminology): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<ClinicalTerminology | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<ClinicalTerminology[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
