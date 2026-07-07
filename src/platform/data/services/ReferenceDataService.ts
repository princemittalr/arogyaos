import { ReferenceData } from '../types';
import { ReferenceDataRepository } from '../repositories/ReferenceDataRepository';

export class ReferenceDataService {
  private static instance: ReferenceDataService;
  private repo = ReferenceDataRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReferenceDataService {
    if (!ReferenceDataService.instance) {
      ReferenceDataService.instance = new ReferenceDataService();
    }
    return ReferenceDataService.instance;
  }

  public async create(data: ReferenceData): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ReferenceData | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ReferenceData[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
