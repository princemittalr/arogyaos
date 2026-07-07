import { ArchivePolicy } from '../types';
import { ArchivePolicyRepository } from '../repositories/ArchivePolicyRepository';

export class ArchivePolicyService {
  private static instance: ArchivePolicyService;
  private repo = ArchivePolicyRepository.getInstance();

  private constructor() {}

  public static getInstance(): ArchivePolicyService {
    if (!ArchivePolicyService.instance) {
      ArchivePolicyService.instance = new ArchivePolicyService();
    }
    return ArchivePolicyService.instance;
  }

  public async create(data: ArchivePolicy): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<ArchivePolicy | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<ArchivePolicy[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
