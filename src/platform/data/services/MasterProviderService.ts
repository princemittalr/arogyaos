import { MasterProvider } from '../types';
import { MasterProviderRepository } from '../repositories/MasterProviderRepository';

export class MasterProviderService {
  private static instance: MasterProviderService;
  private repo = MasterProviderRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterProviderService {
    if (!MasterProviderService.instance) {
      MasterProviderService.instance = new MasterProviderService();
    }
    return MasterProviderService.instance;
  }

  public async create(data: MasterProvider): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterProvider | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterProvider[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
