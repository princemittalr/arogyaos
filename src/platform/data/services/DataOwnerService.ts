import { DataOwner } from '../types';
import { DataOwnerRepository } from '../repositories/DataOwnerRepository';

export class DataOwnerService {
  private static instance: DataOwnerService;
  private repo = DataOwnerRepository.getInstance();

  private constructor() {}

  public static getInstance(): DataOwnerService {
    if (!DataOwnerService.instance) {
      DataOwnerService.instance = new DataOwnerService();
    }
    return DataOwnerService.instance;
  }

  public async create(data: DataOwner): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DataOwner | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DataOwner[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
