import { SchemaRegistry } from '../types';
import { SchemaRegistryRepository } from '../repositories/SchemaRegistryRepository';

export class SchemaRegistryService {
  private static instance: SchemaRegistryService;
  private repo = SchemaRegistryRepository.getInstance();

  private constructor() {}

  public static getInstance(): SchemaRegistryService {
    if (!SchemaRegistryService.instance) {
      SchemaRegistryService.instance = new SchemaRegistryService();
    }
    return SchemaRegistryService.instance;
  }

  public async create(data: SchemaRegistry): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<SchemaRegistry | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<SchemaRegistry[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
