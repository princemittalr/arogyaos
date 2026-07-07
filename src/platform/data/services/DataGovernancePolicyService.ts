import { DataGovernancePolicy } from '../types';
import { DataGovernancePolicyRepository } from '../repositories/DataGovernancePolicyRepository';

export class DataGovernancePolicyService {
  private static instance: DataGovernancePolicyService;
  private repo = DataGovernancePolicyRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataGovernancePolicyService {
    if (!DataGovernancePolicyService.instance) {
      DataGovernancePolicyService.instance = new DataGovernancePolicyService();
    }
    return DataGovernancePolicyService.instance;
  }

  public async create(data: DataGovernancePolicy): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataGovernancePolicy | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataGovernancePolicy[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
