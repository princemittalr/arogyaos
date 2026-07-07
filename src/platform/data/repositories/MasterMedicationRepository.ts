import { MasterMedication } from '../types';

export class MasterMedicationRepository {
  private static instance: MasterMedicationRepository;
  private data: Map<string, MasterMedication> = new Map();

  private constructor() {}

  public static getInstance(): MasterMedicationRepository {
    if (!MasterMedicationRepository.instance) {
      MasterMedicationRepository.instance = new MasterMedicationRepository();
    }
    return MasterMedicationRepository.instance;
  }

  public async save(entity: MasterMedication): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterMedication | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterMedication[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
