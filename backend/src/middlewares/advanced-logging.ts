/**
 * Advanced logging and monitoring middleware
 * Production-ready request/response logging
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires

export interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  userAgent?: string;
  ip: string;
  requestSize: number;
  responseSize: number;
  error?: string;
}

const uuid = require('crypto').randomUUID;

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = uuid();
  const startTime = Date.now();
  const requestSize = JSON.stringify(req.body).length;

  // Attach ID to request for tracking
  (req as any).id = requestId;

  // Track original send
  const originalSend = res.send;
  let responseSize = 0;

  res.send = function (data: any) {
    responseSize = typeof data === 'string' ? data.length : JSON.stringify(data).length;
    return originalSend.call(this, data);
  };

  // Log on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const log: RequestLog = {
      id: requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      userId: (req as any).user?.id,
      userAgent: req.get('user-agent'),
      ip: req.ip || 'unknown',
      requestSize,
      responseSize,
    };

    // Log based on status
    if (res.statusCode >= 500) {
      logger.error('API Error', log);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', log);
    } else if (duration > 1000) {
      logger.warn('Slow Request', log);
    } else {
      logger.info('API Request', log);
    }
  });

  next();
}

/**
 * Error tracking middleware
 */
export function errorTrackingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const errorLog = {
    requestId: (req as any).id,
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
    ip: req.ip,
  };

  logger.error('Unhandled Error', errorLog);

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: (req as any).id,
  });
}

/**
 * Performance monitoring middleware
 */
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const startMemory = process.memoryUsage().heapUsed;
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = seconds * 1000 + nanoseconds / 1000000;
    const memoryDelta = process.memoryUsage().heapUsed - startMemory;

    // Log slow endpoints (>500ms)
    if (durationMs > 500) {
      logger.warn('Slow Endpoint', {
        path: req.path,
        durationMs: Math.round(durationMs),
        memoryDeltaMb: (memoryDelta / 1024 / 1024).toFixed(2),
        status: res.statusCode,
      });
    }
  });

  next();
}

/**
 * Security event logging middleware
 */
export function securityLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Log authentication attempts
  if (req.path.includes('/auth/login')) {
    const log = {
      timestamp: new Date().toISOString(),
      event: 'login_attempt',
      email: req.body?.email,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    res.on('finish', () => {
      if (res.statusCode === 200) {
        logger.info('Successful Login', log);
      } else if (res.statusCode === 401) {
        logger.warn('Failed Login', log);
      }
    });
  }

  // Log admin actions
  if (req.path.includes('/admin') && (req as any).user?.role === 'admin') {
    const log = {
      timestamp: new Date().toISOString(),
      event: 'admin_action',
      adminId: (req as any).user?.id,
      method: req.method,
      path: req.path,
      ip: req.ip,
    };

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.info('Admin Action', log);
      }
    });
  }

  next();
}

/**
 * API usage analytics middleware
 */
export class APIUsageAnalytics {
  private static requestCounts = new Map<string, number>();
  private static endpointStats = new Map<
    string,
    { count: number; totalTime: number; errors: number }
  >();

  static middleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const endpoint = `${req.method} ${req.baseUrl}${req.path}`;

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      // Count requests
      const count = (this.requestCounts.get(endpoint) || 0) + 1;
      this.requestCounts.set(endpoint, count);

      // Track endpoint stats
      const stats = this.endpointStats.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
      stats.count++;
      stats.totalTime += duration;
      if (res.statusCode >= 400) {
        stats.errors++;
      }
      this.endpointStats.set(endpoint, stats);
    });

    next();
  }

  static getStats() {
    const stats = Array.from(this.endpointStats.entries()).map(([endpoint, data]) => ({
      endpoint,
      requestCount: data.count,
      averageTimeMs: Math.round(data.totalTime / data.count),
      errorCount: data.errors,
      errorRate: ((data.errors / data.count) * 100).toFixed(2) + '%',
    }));

    return stats.sort((a, b) => b.requestCount - a.requestCount);
  }

  static reset() {
    this.requestCounts.clear();
    this.endpointStats.clear();
  }
}
