import { CostCenter } from '../types';
import { CostCenterRepository } from '../repositories/CostCenterRepository';

export class CostCenterService {
  private static instance: CostCenterService;
  private repo = CostCenterRepository.getInstance();

  private constructor() {}

  public static getInstance(): CostCenterService {
    if (!CostCenterService.instance) {
      CostCenterService.instance = new CostCenterService();
    }
    return CostCenterService.instance;
  }

  public async create(data: CostCenter): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<CostCenter | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<CostCenter[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
