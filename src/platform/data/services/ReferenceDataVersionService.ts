import { ReferenceDataVersion } from '../types';
import { ReferenceDataVersionRepository } from '../repositories/ReferenceDataVersionRepository';

export class ReferenceDataVersionService {
  private static instance: ReferenceDataVersionService;
  private repo = ReferenceDataVersionRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReferenceDataVersionService {
    if (!ReferenceDataVersionService.instance) {
      ReferenceDataVersionService.instance = new ReferenceDataVersionService();
    }
    return ReferenceDataVersionService.instance;
  }

  public async create(data: ReferenceDataVersion): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ReferenceDataVersion | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ReferenceDataVersion[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
