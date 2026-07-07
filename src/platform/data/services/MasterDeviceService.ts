import { MasterDevice } from '../types';
import { MasterDeviceRepository } from '../repositories/MasterDeviceRepository';

export class MasterDeviceService {
  private static instance: MasterDeviceService;
  private repo = MasterDeviceRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterDeviceService {
    if (!MasterDeviceService.instance) {
      MasterDeviceService.instance = new MasterDeviceService();
    }
    return MasterDeviceService.instance;
  }

  public async create(data: MasterDevice): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterDevice | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterDevice[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
