import { ReferenceDataSet } from '../types';
import { ReferenceDataSetRepository } from '../repositories/ReferenceDataSetRepository';

export class ReferenceDataSetService {
  private static instance: ReferenceDataSetService;
  private repo = ReferenceDataSetRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReferenceDataSetService {
    if (!ReferenceDataSetService.instance) {
      ReferenceDataSetService.instance = new ReferenceDataSetService();
    }
    return ReferenceDataSetService.instance;
  }

  public async create(data: ReferenceDataSet): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ReferenceDataSet | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ReferenceDataSet[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
