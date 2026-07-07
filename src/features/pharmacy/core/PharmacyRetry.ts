export interface RetryOptions {
  aggressive?: boolean;
  signal?: AbortSignal;
}

export class PharmacyRetry {
  static async execute<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T> {
    const maxRetries = options?.aggressive ? 5 : 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      if (options?.signal?.aborted) throw new Error('Operation aborted');
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
    throw new Error('Retry failed');
  }
}
