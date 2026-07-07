import { Incident } from '../types';
import { IncidentRepository } from '../repositories/IncidentRepository';

export class IncidentService {
  private static instance: IncidentService;
  private repo = IncidentRepository.getInstance();

  private constructor() {}

  public static getInstance(): IncidentService {
    if (!IncidentService.instance) {
      IncidentService.instance = new IncidentService();
    }
    return IncidentService.instance;
  }

  public async create(data: Incident): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Incident | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Incident[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
