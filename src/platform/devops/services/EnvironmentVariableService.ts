import { EnvironmentVariable } from '../types';
import { EnvironmentVariableRepository } from '../repositories/EnvironmentVariableRepository';

export class EnvironmentVariableService {
  private static instance: EnvironmentVariableService;
  private repo = EnvironmentVariableRepository.getInstance();

  private constructor() {}

  public static getInstance(): EnvironmentVariableService {
    if (!EnvironmentVariableService.instance) {
      EnvironmentVariableService.instance = new EnvironmentVariableService();
    }
    return EnvironmentVariableService.instance;
  }

  public async create(data: EnvironmentVariable): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<EnvironmentVariable | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<EnvironmentVariable[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
