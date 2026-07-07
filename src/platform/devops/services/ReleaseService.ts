import { Release } from '../types';
import { ReleaseRepository } from '../repositories/ReleaseRepository';

export class ReleaseService {
  private static instance: ReleaseService;
  private repo = ReleaseRepository.getInstance();

  private constructor() {}

  public static getInstance(): ReleaseService {
    if (!ReleaseService.instance) {
      ReleaseService.instance = new ReleaseService();
    }
    return ReleaseService.instance;
  }

  public async create(data: Release): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<Release | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<Release[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
