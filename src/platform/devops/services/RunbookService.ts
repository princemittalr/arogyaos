import { Runbook } from '../types';
import { RunbookRepository } from '../repositories/RunbookRepository';

export class RunbookService {
  private static instance: RunbookService;
  private repo = RunbookRepository.getInstance();

  private constructor() {}

  public static getInstance(): RunbookService {
    if (!RunbookService.instance) {
      RunbookService.instance = new RunbookService();
    }
    return RunbookService.instance;
  }

  public async create(data: Runbook): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Runbook | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Runbook[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
