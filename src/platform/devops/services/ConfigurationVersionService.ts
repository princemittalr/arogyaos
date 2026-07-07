import { ConfigurationVersion } from '../types';
import { ConfigurationVersionRepository } from '../repositories/ConfigurationVersionRepository';

export class ConfigurationVersionService {
  private static instance: ConfigurationVersionService;
  private repo = ConfigurationVersionRepository.getInstance();

  private constructor() {}

  public static getInstance(): ConfigurationVersionService {
    if (!ConfigurationVersionService.instance) {
      ConfigurationVersionService.instance = new ConfigurationVersionService();
    }
    return ConfigurationVersionService.instance;
  }

  public async create(data: ConfigurationVersion): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ConfigurationVersion | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ConfigurationVersion[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
