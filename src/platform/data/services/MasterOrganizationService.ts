import { MasterOrganization } from '../types';
import { MasterOrganizationRepository } from '../repositories/MasterOrganizationRepository';

export class MasterOrganizationService {
  private static instance: MasterOrganizationService;
  private repo = MasterOrganizationRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterOrganizationService {
    if (!MasterOrganizationService.instance) {
      MasterOrganizationService.instance = new MasterOrganizationService();
    }
    return MasterOrganizationService.instance;
  }

  public async create(data: MasterOrganization): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterOrganization | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterOrganization[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
