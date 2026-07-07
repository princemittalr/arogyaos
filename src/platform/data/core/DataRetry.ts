export class DataRetry {
  public static async execute<T>(
    operation: () => Promise<T>,
    options?: { aggressive?: boolean; signal?: AbortSignal; retries?: number; delay?: number; timeout?: number }
  ): Promise<T> {
    const retries = options?.retries ?? (options?.aggressive ? 5 : 3);
    const delay = options?.delay ?? (options?.aggressive ? 500 : 1000);
    
    let attempt = 0;
    while (attempt < retries) {
      if (options?.signal?.aborted) {
        throw new Error('Operation aborted');
      }
      try {
        if (options?.timeout) {
          return await Promise.race([
            operation(),
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), options.timeout))
          ]);
        }
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
        await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Retry failed');
  }
}
