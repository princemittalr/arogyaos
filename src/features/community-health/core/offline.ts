export class CommunityOfflineQueue {
  private queue: any[] = [];

  async enqueue(operation: string, payload: any) {
    this.queue.push({ operation, payload, timestamp: new Date().toISOString() });
    // In production, persist to IndexedDB
  }

  async sync() {
    if (this.queue.length === 0) return;
    // Process queue
    this.queue = [];
  }

  getPendingCount() {
    return this.queue.length;
  }
}

export const offlineQueue = new CommunityOfflineQueue();
