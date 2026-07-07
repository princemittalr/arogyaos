import { Cluster } from '../types';
import { ClusterRepository } from '../repositories/ClusterRepository';

export class ClusterService {
  private static instance: ClusterService;
  private repo = ClusterRepository.getInstance();

  private constructor() {}

  public static getInstance(): ClusterService {
    if (!ClusterService.instance) {
      ClusterService.instance = new ClusterService();
    }
    return ClusterService.instance;
  }

  public async create(data: Cluster): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Cluster | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Cluster[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
