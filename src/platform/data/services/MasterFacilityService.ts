import { MasterFacility } from '../types';
import { MasterFacilityRepository } from '../repositories/MasterFacilityRepository';

export class MasterFacilityService {
  private static instance: MasterFacilityService;
  private repo = MasterFacilityRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterFacilityService {
    if (!MasterFacilityService.instance) {
      MasterFacilityService.instance = new MasterFacilityService();
    }
    return MasterFacilityService.instance;
  }

  public async create(data: MasterFacility): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterFacility | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterFacility[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
