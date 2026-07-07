export class PharmacyCache {
  private static cache = new Map<string, { data: unknown; expiry: number }>();
  
  private static TTL = {
    MEDICATIONS: 1000 * 60 * 60, // 1 hour
    INVENTORY: 1000 * 60 * 5, // 5 minutes
    DISPENSING: 1000 * 60 * 2, // 2 minutes
    STATISTICS: 1000 * 60 * 15, // 15 minutes
    RECALLS: 1000 * 60 * 60 * 24, // 24 hours
    SUPPLIERS: 1000 * 60 * 60 * 12, // 12 hours
    ALERTS: 1000 * 60 * 5 // 5 minutes
  };

  static set(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  static invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  static getTTLs() {
    return this.TTL;
  }
}
