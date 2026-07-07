import { Runbook } from '../types';

export class RunbookRepository {
  private static instance: RunbookRepository;
  private data: Map<string, Runbook> = new Map();

  private constructor() {}

  public static getInstance(): RunbookRepository {
    if (!RunbookRepository.instance) {
      RunbookRepository.instance = new RunbookRepository();
    }
    return RunbookRepository.instance;
  }

  public async save(entity: Runbook): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Runbook | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Runbook[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
