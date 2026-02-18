import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Simple in-memory rate limiter
 * Production should use Redis for distributed rate limiting
 */
export class RateLimiter {
  private store: RateLimitStore = {};
  private readonly requestLimit: number;
  private readonly windowMs: number;

  constructor(requestLimit = 100, windowMs = 15 * 60 * 1000) {
    this.requestLimit = requestLimit; // requests
    this.windowMs = windowMs; // time window in ms
  }

  /**
   * Middleware function for Express
   */
  middleware(req: Request, res: Response, next: NextFunction): void {
    // Use IP address as key
    const key = req.ip || req.connection.remoteAddress || 'unknown';

    // Initialize or get existing entry
    const now = Date.now();
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Increment request count
    this.store[key].count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.requestLimit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.requestLimit - this.store[key].count));
    res.setHeader('X-RateLimit-Reset', this.store[key].resetTime);

    // Check if limit exceeded
    if (this.store[key].count > this.requestLimit) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
      });
      return;
    }

    next();
  }

  /**
   * Get current stats for key
   */
  getStats(key: string) {
    return this.store[key] || null;
  }

  /**
   * Reset store (for testing or manual reset)
   */
  reset(key?: string): void {
    if (key) {
      delete this.store[key];
    } else {
      this.store = {};
    }
  }

  /**
   * Cleanup old entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const key in this.store) {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    }
  }
}

// Export default instance (100 requests per 15 minutes)
export const rateLimiter = new RateLimiter(100, 15 * 60 * 1000);

// Strict rate limiter for expensive operations (20 requests per hour)
export const strictRateLimiter = new RateLimiter(20, 60 * 60 * 1000);
