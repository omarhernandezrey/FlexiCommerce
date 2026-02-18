/**
 * Simple in-memory cache with TTL and invalidation
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(ttlMs: number = 60000, autoCleanupIntervalMs: number = 120000) {
    this.ttlMs = ttlMs;
    this.startAutoCleanup(autoCleanupIntervalMs);
  }

  set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs || this.ttlMs);
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  invalidate(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  /**
   * Get or compute value if not in cache
   */
  async getOrCompute(
    key: string,
    compute: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) return cached;

    const value = await compute();
    this.set(key, value, ttlMs);
    return value;
  }

  private startAutoCleanup(intervalMs: number): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.expiresAt) {
          this.store.delete(key);
        }
      }
    }, intervalMs);

    // Unref timer so it doesn't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * Middleware for caching HTTP responses
 */
export function cacheMiddleware(options: {
  keyGenerator?: (req: any) => string;
  ttlMs?: number;
  excludeStatusCodes?: number[];
} = {}) {
  const cache = new Cache<{
    status: number;
    headers: Record<string, string>;
    body: any;
  }>(options.ttlMs || 60000);

  return (req: any, res: any, next: any) => {
    const keyGenerator = options.keyGenerator || ((req) => `${req.method}:${req.originalUrl}`);
    const key = keyGenerator(req);
    const excludedStatuses = options.excludeStatusCodes || [4, 5]; // 400s, 500s

    // Check cache for GET requests
    if (req.method === 'GET') {
      const cached = cache.get(key);
      if (cached) {
        return res.status(cached.status).set(cached.headers).json(cached.body);
      }
    }

    // Intercept response
    const originalJson = res.json;
    res.json = function (body: any) {
      if (req.method === 'GET' && !excludedStatuses.includes(Math.floor(res.statusCode / 100))) {
        cache.set(key, {
          status: res.statusCode,
          headers: res.getHeaders(),
          body,
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
}

/**
 * Cache key helpers
 */
export const cacheKeys = {
  products: (page: number, limit: number, categoryId?: string) =>
    `products:${page}:${limit}:${categoryId || 'all'}`,

  product: (id: string) => `product:${id}`,

  orders: (userId: string, page: number) => `orders:${userId}:${page}`,

  order: (id: string) => `order:${id}`,

  reviews: (productId: string) => `reviews:${productId}`,

  user: (id: string) => `user:${id}`,

  categories: () => 'categories',

  search: (query: string, page: number) => `search:${query}:${page}`,
};
