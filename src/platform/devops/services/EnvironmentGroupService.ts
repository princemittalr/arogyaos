import { EnvironmentGroup } from '../types';
import { EnvironmentGroupRepository } from '../repositories/EnvironmentGroupRepository';

export class EnvironmentGroupService {
  private static instance: EnvironmentGroupService;
  private repo = EnvironmentGroupRepository.getInstance();

  private constructor() {}

  public static getInstance(): EnvironmentGroupService {
    if (!EnvironmentGroupService.instance) {
      EnvironmentGroupService.instance = new EnvironmentGroupService();
    }
    return EnvironmentGroupService.instance;
  }

  public async create(data: EnvironmentGroup): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<EnvironmentGroup | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<EnvironmentGroup[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
