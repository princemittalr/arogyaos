import { ConfigurationItem } from '../types';
import { ConfigurationItemRepository } from '../repositories/ConfigurationItemRepository';

export class ConfigurationItemService {
  private static instance: ConfigurationItemService;
  private repo = ConfigurationItemRepository.getInstance();

  private constructor() {}

  public static getInstance(): ConfigurationItemService {
    if (!ConfigurationItemService.instance) {
      ConfigurationItemService.instance = new ConfigurationItemService();
    }
    return ConfigurationItemService.instance;
  }

  public async create(data: ConfigurationItem): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ConfigurationItem | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ConfigurationItem[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
