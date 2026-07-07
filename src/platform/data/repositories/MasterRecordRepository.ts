import { MasterRecord } from '../types';

export class MasterRecordRepository {
  private static instance: MasterRecordRepository;
  private data: Map<string, MasterRecord> = new Map();

  private constructor() {}

  public static getInstance(): MasterRecordRepository {
    if (!MasterRecordRepository.instance) {
      MasterRecordRepository.instance = new MasterRecordRepository();
    }
    return MasterRecordRepository.instance;
  }

  public async save(entity: MasterRecord): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<MasterRecord | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<MasterRecord[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
