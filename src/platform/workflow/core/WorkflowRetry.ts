export class WorkflowRetry {
  async execute<T>(
    operation: () => Promise<T>,
    options?: { aggressive?: boolean; signal?: AbortSignal }
  ): Promise<T> {
    return operation();
  }

  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    options?: { aggressive?: boolean; signal?: AbortSignal }
  ): Promise<T> {
    try {
      return await this.execute(operation, options);
    } catch {
      return fallback();
    }
  }
}
