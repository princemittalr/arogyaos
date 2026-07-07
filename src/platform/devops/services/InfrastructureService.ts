import { InfrastructureResource } from '../types';
import { InfrastructureRepository } from '../repositories/InfrastructureRepository';

export class InfrastructureService {
  private static instance: InfrastructureService;
  private repo = InfrastructureRepository.getInstance();

  private constructor() {}

  public static getInstance(): InfrastructureService {
    if (!InfrastructureService.instance) {
      InfrastructureService.instance = new InfrastructureService();
    }
    return InfrastructureService.instance;
  }

  public async create(data: InfrastructureResource): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<InfrastructureResource | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<InfrastructureResource[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
