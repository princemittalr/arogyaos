import { AlertPolicy } from '../types';
import { AlertPolicyRepository } from '../repositories/AlertPolicyRepository';

export class AlertPolicyService {
  private static instance: AlertPolicyService;
  private repo = AlertPolicyRepository.getInstance();

  private constructor() {}

  public static getInstance(): AlertPolicyService {
    if (!AlertPolicyService.instance) {
      AlertPolicyService.instance = new AlertPolicyService();
    }
    return AlertPolicyService.instance;
  }

  public async create(data: AlertPolicy): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<AlertPolicy | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<AlertPolicy[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
