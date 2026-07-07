import { SchemaDefinition } from '../types';

export class SchemaRegistryRepository {
  async save(schema: SchemaDefinition): Promise<SchemaDefinition> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<SchemaDefinition | null> {
    throw new Error('Not implemented');
  }
}
