import { DisasterRecoveryPlan } from '../types';
import { DisasterRecoveryRepository } from '../repositories/DisasterRecoveryRepository';

export class DisasterRecoveryService {
  private static instance: DisasterRecoveryService;
  private repo = DisasterRecoveryRepository.getInstance();

  private constructor() {}

  public static getInstance(): DisasterRecoveryService {
    if (!DisasterRecoveryService.instance) {
      DisasterRecoveryService.instance = new DisasterRecoveryService();
    }
    return DisasterRecoveryService.instance;
  }

  public async create(data: DisasterRecoveryPlan): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<DisasterRecoveryPlan | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<DisasterRecoveryPlan[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
