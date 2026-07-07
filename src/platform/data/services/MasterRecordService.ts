import { MasterRecord } from '../types';
import { MasterRecordRepository } from '../repositories/MasterRecordRepository';

export class MasterRecordService {
  private static instance: MasterRecordService;
  private repo = MasterRecordRepository.getInstance();

  private constructor() {}

  public static getInstance(): MasterRecordService {
    if (!MasterRecordService.instance) {
      MasterRecordService.instance = new MasterRecordService();
    }
    return MasterRecordService.instance;
  }

  public async create(data: MasterRecord): Promise<void> {
    await this.repo.save(data);
  }

  public async get(id: string): Promise<MasterRecord | undefined> {
    return this.repo.get(id);
  }

  public async list(): Promise<MasterRecord[]> {
    return this.repo.list();
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
