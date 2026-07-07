import { DataAudit } from '../types';
import { DataAuditRepository } from '../repositories/DataAuditRepository';

export class DataAuditService {
  private static instance: DataAuditService;
  private repo = DataAuditRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataAuditService {
    if (!DataAuditService.instance) {
      DataAuditService.instance = new DataAuditService();
    }
    return DataAuditService.instance;
  }

  public async create(data: DataAudit): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataAudit | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataAudit[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
