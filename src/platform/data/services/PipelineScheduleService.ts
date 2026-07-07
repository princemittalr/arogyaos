import { PipelineSchedule } from '../types';
import { PipelineScheduleRepository } from '../repositories/PipelineScheduleRepository';

export class PipelineScheduleService {
  private static instance: PipelineScheduleService;
  private repo = PipelineScheduleRepository.getInstance();

  private constructor() {}

  public static getInstance(): PipelineScheduleService {
    if (!PipelineScheduleService.instance) {
      PipelineScheduleService.instance = new PipelineScheduleService();
    }
    return PipelineScheduleService.instance;
  }

  public async create(data: PipelineSchedule): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<PipelineSchedule | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<PipelineSchedule[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
