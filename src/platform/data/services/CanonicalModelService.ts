import { CanonicalModel } from '../types';
import { CanonicalModelRepository } from '../repositories/CanonicalModelRepository';

export class CanonicalModelService {
  private static instance: CanonicalModelService;
  private repo = CanonicalModelRepository.getInstance();

  private constructor() {}

  public static getInstance(): CanonicalModelService {
    if (!CanonicalModelService.instance) {
      CanonicalModelService.instance = new CanonicalModelService();
    }
    return CanonicalModelService.instance;
  }

  public async create(data: CanonicalModel): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<CanonicalModel | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<CanonicalModel[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
