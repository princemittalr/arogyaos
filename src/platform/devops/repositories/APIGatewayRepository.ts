import { APIGateway } from '../types';

export class APIGatewayRepository {
  private static instance: APIGatewayRepository;
  private data: Map<string, APIGateway> = new Map();

  private constructor() {}

  public static getInstance(): APIGatewayRepository {
    if (!APIGatewayRepository.instance) {
      APIGatewayRepository.instance = new APIGatewayRepository();
    }
    return APIGatewayRepository.instance;
  }

  public async save(entity: APIGateway): Promise<void> {
    const entityData = entity as unknown as Record<string, unknown>;
    const id = String(entityData.id || entityData.key || entityData.versionId || entityData.version || entityData.name || crypto.randomUUID());
    this.data.set(id, entity);
  }

  public async get(id: string): Promise<APIGateway | undefined> {
    return this.data.get(id);
  }

  public async list(): Promise<APIGateway[]> {
    return Array.from(this.data.values());
  }

  public async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
