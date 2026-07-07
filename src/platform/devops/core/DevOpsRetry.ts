export class DevOpsRetry {
  public static async execute<T>(
    operation: () => Promise<T>,
    options?: { aggressive?: boolean; signal?: AbortSignal; retries?: number; delay?: number }
  ): Promise<T> {
    const retries = options?.retries ?? (options?.aggressive ? 5 : 3);
    const delay = options?.delay ?? (options?.aggressive ? 500 : 1000);
    
    let attempt = 0;
    while (attempt < retries) {
      if (options?.signal?.aborted) {
        throw new Error('Operation aborted');
      }
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error('Retry failed');
  }
}
