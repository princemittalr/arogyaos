import { PipelineSchedule } from '../types';

export class PipelineScheduleRepository {
  private static instance: PipelineScheduleRepository;
  private data: Map<string, PipelineSchedule> = new Map();

  private constructor() {}

  public static getInstance(): PipelineScheduleRepository {
    if (!PipelineScheduleRepository.instance) {
      PipelineScheduleRepository.instance = new PipelineScheduleRepository();
    }
    return PipelineScheduleRepository.instance;
  }

  public async save(entity: PipelineSchedule): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<PipelineSchedule | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<PipelineSchedule[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
