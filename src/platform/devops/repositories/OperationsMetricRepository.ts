import { OperationsMetric } from '../types';

export class OperationsMetricRepository {
  private static instance: OperationsMetricRepository;
  private data: Map<string, OperationsMetric> = new Map();

  private constructor() {}

  public static getInstance(): OperationsMetricRepository {
    if (!OperationsMetricRepository.instance) {
      OperationsMetricRepository.instance = new OperationsMetricRepository();
    }
    return OperationsMetricRepository.instance;
  }

  public async save(entity: OperationsMetric): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<OperationsMetric | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<OperationsMetric[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
