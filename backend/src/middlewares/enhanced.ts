/**
 * Enhanced middleware setup for Express app
 * Includes logging, compression, rate limiting, and request tracking
 */

import { Express, Request, Response, NextFunction } from 'express';
import compression from 'compression';

/**
 * Request/response logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const originalJsonSend = res.json;

  // Override json method to log response
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        query: req.query,
        statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      })
    );

    return originalJsonSend.call(this, body);
  };

  next();
}

/**
 * Request ID tracking middleware
 */
export function requestIdTracker(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', requestId);
  (req as any).id = requestId;
  next();
}

/**
 * Setup compression middleware
 */
export function setupCompression(app: Express) {
  app.use(
    compression({
      filter: (_req: Request, res: Response) => {
        // Don't compress responses asking explicitly not to
        if (res.getHeader('x-no-compression')) {
          return false;
        }
        // Compress by default
        return true;
      },
      level: 6, // Balance between compression ratio and speed
      threshold: 1000, // Compress responses larger than 1KB
    })
  );
}

/**
 * Performance monitoring middleware
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000; // Convert to ms

    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }

    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    return originalSend.call(this, data);
  };

  next();
}

/**
 * CORS with preflight caching
 */
export function enhancedCors(
  app: Express,
  options: { origin?: string; maxAge?: number } = {}
) {
  const origin = options.origin || process.env.CORS_ORIGIN || 'http://localhost:3000';
  const maxAge = options.maxAge || 86400; // 24 hours

  app.options('*', (_req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
    res.header('Access-Control-Max-Age', maxAge.toString());
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
}

/**
 * API rate limiting (simple in-memory implementation)
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  private getKey(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter((ts) => now - ts < this.windowMs);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();

      // Get or initialize timestamps for this key
      let timestamps = this.requests.get(key) || [];

      // Remove timestamps outside the window
      timestamps = timestamps.filter((ts) => now - ts < this.windowMs);

      if (timestamps.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Intenta más tarde.',
          retryAfter: Math.ceil((this.windowMs - (now - timestamps[0])) / 1000),
        });
      }

      timestamps.push(now);
      this.requests.set(key, timestamps);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - timestamps.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + this.windowMs).toISOString());

      next();
      return undefined;
    };
  }
}

/**
 * Apply all enhanced middleware
 */
export function applyEnhancedMiddleware(app: Express) {
  // Request tracking
  app.use(requestIdTracker);
  app.use(requestLogger);
  app.use(performanceMonitor);

  // Compression
  setupCompression(app);

  // Security
  app.use(securityHeaders);

  // CORS
  enhancedCors(app);

  // Rate limiting (10 requests per second per IP)
  const limiter = new RateLimiter(1000, 10);
  app.use(limiter.middleware());
}