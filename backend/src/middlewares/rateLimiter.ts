/**
 * Distributed Rate Limiter usando rate-limiter-flexible + Redis
 * Si Redis no está disponible, usa el rate limiter en memoria como fallback
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterAbstract } from 'rate-limiter-flexible';
import { logger } from '../utils/logger.js';

// Lazy-load ioredis para evitar errores si no está instalado
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    const { default: Redis } = await import('ioredis');
    const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });

    await client.ping();
    redisClient = client;
    logger.info('Redis conectado para rate limiting distribuido');
    return client;
  } catch (error) {
    logger.warn('Redis no disponible. Usando rate limiter en memoria (no distribuido)');
    return null;
  }
}

/**
 * Crea un rate limiter: Redis si está disponible, memoria si no
 */
async function createRateLimiter(options: {
  points: number;
  duration: number; // en segundos
  keyPrefix: string;
}): Promise<RateLimiterAbstract> {
  const redis = await getRedisClient();

  if (redis) {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: options.keyPrefix,
      points: options.points,
      duration: options.duration,
    });
  }

  return new RateLimiterMemory({
    keyPrefix: options.keyPrefix,
    points: options.points,
    duration: options.duration,
  });
}

// Rate limiters singleton (inicializados lazy)
let generalLimiter: RateLimiterAbstract | null = null;
let authLimiter: RateLimiterAbstract | null = null;

async function getGeneralLimiter(): Promise<RateLimiterAbstract> {
  if (!generalLimiter) {
    generalLimiter = await createRateLimiter({
      keyPrefix: 'rl_general',
      points: 100, // 100 peticiones
      duration: 60, // por minuto
    });
  }
  return generalLimiter;
}

async function getAuthLimiter(): Promise<RateLimiterAbstract> {
  if (!authLimiter) {
    // En desarrollo, permitir más intentos; en producción ser más restrictivo
    const isDevelopment = process.env.NODE_ENV === 'development';
    authLimiter = await createRateLimiter({
      keyPrefix: 'rl_auth',
      points: isDevelopment ? 30 : 5, // 30 intentos en dev, 5 en prod
      duration: isDevelopment ? 60 : 900, // cada 1 minuto en dev, 15 minutos en prod
    });
  }
  return authLimiter;
}

function getClientKey(req: Request): string {
  // Usar userId si está autenticado, si no usar IP
  const userId = (req as any).user?.id;
  if (userId) return `user_${userId}`;
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Middleware de rate limiting general: 100 req/min por IP o usuario
 */
export function generalRateLimiter() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limiter = await getGeneralLimiter();
      const key = getClientKey(req);
      const result = await limiter.consume(key);

      res.setHeader('X-RateLimit-Limit', 100);
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString());

      next();
    } catch (error: any) {
      if (error.remainingPoints !== undefined) {
        // Rate limit excedido
        res.setHeader('Retry-After', Math.ceil(error.msBeforeNext / 1000));
        res.setHeader('X-RateLimit-Remaining', 0);
        res.status(429).json({
          error: 'Demasiadas solicitudes. Intenta más tarde.',
          retryAfter: Math.ceil(error.msBeforeNext / 1000),
        });
      } else {
        // Error de Redis u otro error - dejar pasar para no bloquear el servicio
        logger.error('Error en rate limiter:', error);
        next();
      }
    }
  };
}

/**
 * Middleware de rate limiting para auth: 5 intentos/15min por IP
 * Usar en rutas de login y register
 */
export function authRateLimiter() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limiter = await getAuthLimiter();
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      await limiter.consume(key);
      next();
    } catch (error: any) {
      if (error.remainingPoints !== undefined) {
        const retryAfterSeconds = Math.ceil(error.msBeforeNext / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        res.status(429).json({
          error: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(retryAfterSeconds / 60)} minutos.`,
          retryAfter: retryAfterSeconds,
        });
      } else {
        logger.error('Error en auth rate limiter:', error);
        next();
      }
    }
  };
}
