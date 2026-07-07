import { Outbreak, OutbreakStatus, OutbreakCluster } from '../types';

export class OutbreakRepository {
  async findById(id: string): Promise<Outbreak | null> {
    throw new Error('Not implemented');
  }

  async findActiveOutbreaks(): Promise<Outbreak[]> {
    throw new Error('Not implemented');
  }

  async save(outbreak: Outbreak): Promise<Outbreak> {
    throw new Error('Not implemented');
  }

  async saveCluster(cluster: OutbreakCluster): Promise<OutbreakCluster> {
    throw new Error('Not implemented');
  }

  async updateStatus(id: string, status: OutbreakStatus): Promise<void> {
    throw new Error('Not implemented');
  }
}
