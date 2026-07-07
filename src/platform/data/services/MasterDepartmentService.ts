import { MasterDepartment } from '../types';
import { MasterDepartmentRepository } from '../repositories/MasterDepartmentRepository';

export class MasterDepartmentService {
  private static instance: MasterDepartmentService;
  private repo = MasterDepartmentRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterDepartmentService {
    if (!MasterDepartmentService.instance) {
      MasterDepartmentService.instance = new MasterDepartmentService();
    }
    return MasterDepartmentService.instance;
  }

  public async create(data: MasterDepartment): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterDepartment | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterDepartment[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
