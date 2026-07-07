import { BackupPolicy } from '../types';
import { BackupPolicyRepository } from '../repositories/BackupPolicyRepository';

export class BackupPolicyService {
  private static instance: BackupPolicyService;
  private repo = BackupPolicyRepository.getInstance();

  private constructor() {}

  public static getInstance(): BackupPolicyService {
    if (!BackupPolicyService.instance) {
      BackupPolicyService.instance = new BackupPolicyService();
    }
    return BackupPolicyService.instance;
  }

  public async create(data: BackupPolicy): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<BackupPolicy | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<BackupPolicy[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
