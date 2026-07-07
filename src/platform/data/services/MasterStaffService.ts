import { MasterStaff } from '../types';
import { MasterStaffRepository } from '../repositories/MasterStaffRepository';

export class MasterStaffService {
  private static instance: MasterStaffService;
  private repo = MasterStaffRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterStaffService {
    if (!MasterStaffService.instance) {
      MasterStaffService.instance = new MasterStaffService();
    }
    return MasterStaffService.instance;
  }

  public async create(data: MasterStaff): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterStaff | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterStaff[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
