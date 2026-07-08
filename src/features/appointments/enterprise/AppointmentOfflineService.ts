import { vaultOfflineQueue } from '@/features/health-vault/services/VaultOfflineQueue';

const APPOINTMENT_OPERATIONS = {
  CREATE: 'APPOINTMENT_QUEUE_CREATE',
  UPDATE: 'APPOINTMENT_QUEUE_UPDATE',
  CANCEL: 'APPOINTMENT_QUEUE_CANCEL',
  RESCHEDULE: 'APPOINTMENT_QUEUE_RESCHEDULE',
  CHECK_IN: 'APPOINTMENT_QUEUE_CHECK_IN',
  COMPLETE: 'APPOINTMENT_QUEUE_COMPLETE',
} as const;

type AppointmentQueueOperation = typeof APPOINTMENT_OPERATIONS[keyof typeof APPOINTMENT_OPERATIONS];

interface AppointmentQueuedOperation {
  queueId: string;
  operation: AppointmentQueueOperation;
  queuedAt: string;
  retries: number;
  appointmentId: string;
  patientId: string;
  payload?: Record<string, unknown>;
}

const APPOINTMENT_QUEUE_KEY = 'apt_offline_queue';
const MAX_RETRIES = 5;

export class AppointmentOfflineService {
  private static instance: AppointmentOfflineService;

  private constructor() {}

  public static getInstance(): AppointmentOfflineService {
    if (!AppointmentOfflineService.instance) {
      AppointmentOfflineService.instance = new AppointmentOfflineService();
    }
    return AppointmentOfflineService.instance;
  }

  public get isOnline(): boolean {
    return vaultOfflineQueue.getConnectionStatus();
  }

  public onConnectionChange(listener: (online: boolean) => void): () => void {
    return vaultOfflineQueue.onConnectionChange(listener);
  }

  private readQueue(): AppointmentQueuedOperation[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(APPOINTMENT_QUEUE_KEY);
      return raw ? (JSON.parse(raw) as AppointmentQueuedOperation[]) : [];
    } catch {
      return [];
    }
  }

  private writeQueue(queue: AppointmentQueuedOperation[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(APPOINTMENT_QUEUE_KEY, JSON.stringify(queue));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AppointmentOfflineService] Failed to persist queue.', msg);
    }
  }

  public enqueue(
    operation: AppointmentQueueOperation,
    appointmentId: string,
    patientId: string,
    payload?: Record<string, unknown>,
  ): void {
    const queue = this.readQueue();
    const existing = queue.find((e) => e.queueId === `${operation}_${appointmentId}`);
    if (existing) return;

    const entry: AppointmentQueuedOperation = {
      queueId: `${operation}_${appointmentId}`,
      operation,
      queuedAt: new Date().toISOString(),
      retries: 0,
      appointmentId,
      patientId,
      payload,
    };

    this.writeQueue([...queue, entry]);

    if (this.isOnline) {
      void this.processPendingQueue();
    }
  }

  public dequeue(queueId: string): void {
    const queue = this.readQueue().filter((e) => e.queueId !== queueId);
    this.writeQueue(queue);
  }

  public getPendingOperations(): AppointmentQueuedOperation[] {
    return this.readQueue();
  }

  public hasPendingOperations(): boolean {
    return this.readQueue().length > 0;
  }

  public async processPendingQueue(
    executor?: (op: AppointmentQueuedOperation) => Promise<void>,
  ): Promise<void> {
    const queue = this.readQueue();
    if (queue.length === 0) return;
    if (!executor) return; // Prevent clearing the queue if no executor is provided

    const remaining: AppointmentQueuedOperation[] = [];

    for (const op of queue) {
      if (!this.isOnline) {
        remaining.push(op);
        continue;
      }

      try {
        if (executor) {
          await executor(op);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[AppointmentOfflineService] Sync attempt failed.', {
          queueId: op.queueId,
          operation: op.operation,
          retries: op.retries,
          error: msg,
        });

        if (op.retries < MAX_RETRIES) {
          remaining.push({ ...op, retries: op.retries + 1 });
        } else {
          console.error('[AppointmentOfflineService] Max retries exceeded — dropping operation.', {
            queueId: op.queueId,
            operation: op.operation,
          });
        }
      }
    }

    this.writeQueue(remaining);
  }
}

export const appointmentOfflineService = AppointmentOfflineService.getInstance();
export { APPOINTMENT_OPERATIONS };
export type { AppointmentQueueOperation, AppointmentQueuedOperation };
