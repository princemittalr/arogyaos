import { Incident } from '../types';

export class IncidentRepository {
  private static instance: IncidentRepository;
  private data: Map<string, Incident> = new Map();

  private constructor() {}

  public static getInstance(): IncidentRepository {
    if (!IncidentRepository.instance) {
      IncidentRepository.instance = new IncidentRepository();
    }
    return IncidentRepository.instance;
  }

  public async save(entity: Incident): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<Incident | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<Incident[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
