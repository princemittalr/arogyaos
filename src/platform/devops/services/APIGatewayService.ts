import { APIGateway } from '../types';
import { APIGatewayRepository } from '../repositories/APIGatewayRepository';

export class APIGatewayService {
  private static instance: APIGatewayService;
  private repo = APIGatewayRepository.getInstance();

  private constructor() {}

  public static getInstance(): APIGatewayService {
    if (!APIGatewayService.instance) {
      APIGatewayService.instance = new APIGatewayService();
    }
    return APIGatewayService.instance;
  }

  public async create(data: APIGateway): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<APIGateway | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<APIGateway[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
