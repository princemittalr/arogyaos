export class DevOpsCache {
  private static instance: DevOpsCache;
  private cache = new Map<string, unknown>();

  private constructor() {}

  public static getInstance(): DevOpsCache {
    if (!DevOpsCache.instance) DevOpsCache.instance = new DevOpsCache();
    return DevOpsCache.instance;
  }

  public set(key: string, data: unknown): void {
    this.cache.set(key, data);
  }

  public get<T>(key: string): T | null {
    return (this.cache.get(key) as T) || null;
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }
}
