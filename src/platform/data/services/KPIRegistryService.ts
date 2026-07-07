import { KPIRegistry } from '../types';
import { KPIRegistryRepository } from '../repositories/KPIRegistryRepository';

export class KPIRegistryService {
  private static instance: KPIRegistryService;
  private repo = KPIRegistryRepository.getInstance();

  private constructor() {}

  public static getInstance(): KPIRegistryService {
    if (!KPIRegistryService.instance) {
      KPIRegistryService.instance = new KPIRegistryService();
    }
    return KPIRegistryService.instance;
  }

  public async create(data: KPIRegistry): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<KPIRegistry | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<KPIRegistry[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
