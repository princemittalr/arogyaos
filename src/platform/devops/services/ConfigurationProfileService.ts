import { ConfigurationProfile } from '../types';
import { ConfigurationProfileRepository } from '../repositories/ConfigurationProfileRepository';

export class ConfigurationProfileService {
  private static instance: ConfigurationProfileService;
  private repo = ConfigurationProfileRepository.getInstance();

  private constructor() {}

  public static getInstance(): ConfigurationProfileService {
    if (!ConfigurationProfileService.instance) {
      ConfigurationProfileService.instance = new ConfigurationProfileService();
    }
    return ConfigurationProfileService.instance;
  }

  public async create(data: ConfigurationProfile): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ConfigurationProfile | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ConfigurationProfile[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
