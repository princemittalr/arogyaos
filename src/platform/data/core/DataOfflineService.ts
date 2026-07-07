export interface OfflineOperation {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

export class DataOfflineService {
  private static instance: DataOfflineService;
  private queue: OfflineOperation[] = [];
  
  private constructor() {}

  public static getInstance(): DataOfflineService {
    if (!DataOfflineService.instance) DataOfflineService.instance = new DataOfflineService();
    return DataOfflineService.instance;
  }

  public queueOperation(type: string, payload: Record<string, unknown>): void {
    this.queue.push({
      id: crypto.randomUUID(),
      type,
      payload,
      status: 'pending',
      retryCount: 0
    });
  }

  public getQueue(): OfflineOperation[] {
    return [...this.queue];
  }

  public async sync(): Promise<void> {
    const pending = this.queue.filter(op => op.status === 'pending' || op.status === 'failed');
    for (const op of pending) {
      op.status = 'syncing';
      // Simulate network metadata sync
      op.status = 'pending';
    }
    this.queue = [];
  }

  public clearQueue(): void {
    this.queue = [];
  }
}
