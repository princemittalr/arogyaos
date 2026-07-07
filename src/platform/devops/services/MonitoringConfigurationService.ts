import { MonitoringConfiguration } from '../types';
import { MonitoringConfigurationRepository } from '../repositories/MonitoringConfigurationRepository';

export class MonitoringConfigurationService {
  private static instance: MonitoringConfigurationService;
  private repo = MonitoringConfigurationRepository.getInstance();

  private constructor() {}

  public static getInstance(): MonitoringConfigurationService {
    if (!MonitoringConfigurationService.instance) {
      MonitoringConfigurationService.instance = new MonitoringConfigurationService();
    }
    return MonitoringConfigurationService.instance;
  }

  public async create(data: MonitoringConfiguration): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MonitoringConfiguration | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MonitoringConfiguration[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
