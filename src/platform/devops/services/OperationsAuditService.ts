import { OperationsAudit } from '../types';
import { OperationsAuditRepository } from '../repositories/OperationsAuditRepository';

export class OperationsAuditService {
  private static instance: OperationsAuditService;
  private repo = OperationsAuditRepository.getInstance();

  private constructor() {}

  public static getInstance(): OperationsAuditService {
    if (!OperationsAuditService.instance) {
      OperationsAuditService.instance = new OperationsAuditService();
    }
    return OperationsAuditService.instance;
  }

  public async create(data: OperationsAudit): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<OperationsAudit | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<OperationsAudit[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
