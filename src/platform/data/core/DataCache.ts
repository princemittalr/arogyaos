export class DataCache {
  private static instance: DataCache;
  private cache = new Map<string, unknown>();

  private constructor() {}

  public static getInstance(): DataCache {
    if (!DataCache.instance) DataCache.instance = new DataCache();
    return DataCache.instance;
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
