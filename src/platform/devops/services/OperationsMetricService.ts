import { OperationsMetric } from '../types';
import { OperationsMetricRepository } from '../repositories/OperationsMetricRepository';

export class OperationsMetricService {
  private static instance: OperationsMetricService;
  private repo = OperationsMetricRepository.getInstance();

  private constructor() {}

  public static getInstance(): OperationsMetricService {
    if (!OperationsMetricService.instance) {
      OperationsMetricService.instance = new OperationsMetricService();
    }
    return OperationsMetricService.instance;
  }

  public async create(data: OperationsMetric): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<OperationsMetric | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<OperationsMetric[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
