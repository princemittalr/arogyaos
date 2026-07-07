import { SchemaRegistry } from '../types';

export class SchemaRegistryRepository {
  private static instance: SchemaRegistryRepository;
  private data: Map<string, SchemaRegistry> = new Map();

  private constructor() {}

  public static getInstance(): SchemaRegistryRepository {
    if (!SchemaRegistryRepository.instance) {
      SchemaRegistryRepository.instance = new SchemaRegistryRepository();
    }
    return SchemaRegistryRepository.instance;
  }

  public async save(entity: SchemaRegistry): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<SchemaRegistry | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<SchemaRegistry[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
