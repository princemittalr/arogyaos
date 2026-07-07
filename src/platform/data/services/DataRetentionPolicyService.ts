import { DataRetentionPolicy } from '../types';
import { DataRetentionPolicyRepository } from '../repositories/DataRetentionPolicyRepository';

export class DataRetentionPolicyService {
  private static instance: DataRetentionPolicyService;
  private repo = DataRetentionPolicyRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataRetentionPolicyService {
    if (!DataRetentionPolicyService.instance) {
      DataRetentionPolicyService.instance = new DataRetentionPolicyService();
    }
    return DataRetentionPolicyService.instance;
  }

  public async create(data: DataRetentionPolicy): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataRetentionPolicy | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataRetentionPolicy[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
