import { MasterLaboratory } from '../types';
import { MasterLaboratoryRepository } from '../repositories/MasterLaboratoryRepository';

export class MasterLaboratoryService {
  private static instance: MasterLaboratoryService;
  private repo = MasterLaboratoryRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterLaboratoryService {
    if (!MasterLaboratoryService.instance) {
      MasterLaboratoryService.instance = new MasterLaboratoryService();
    }
    return MasterLaboratoryService.instance;
  }

  public async create(data: MasterLaboratory): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterLaboratory | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterLaboratory[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
