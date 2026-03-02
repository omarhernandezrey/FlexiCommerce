/**
 * Middleware de métricas Prometheus para D5-01 — Monitoring
 * Expone /api/metrics para ser scrapeado por Prometheus
 */

import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Registrar métricas por defecto de Node.js (memory, CPU, etc.)
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'flexicommerce_' });

// Métricas personalizadas de HTTP
const httpRequestDuration = new client.Histogram({
  name: 'flexicommerce_http_request_duration_seconds',
  help: 'Duración de las solicitudes HTTP en segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'flexicommerce_http_requests_total',
  help: 'Total de solicitudes HTTP',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestsInFlight = new client.Gauge({
  name: 'flexicommerce_http_requests_in_flight',
  help: 'Solicitudes HTTP en curso',
  registers: [register],
});

/**
 * Middleware que mide el tiempo de cada request
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = process.hrtime.bigint();
  httpRequestsInFlight.inc();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - startTime) / 1e9;
    const route = req.route?.path || req.path || 'unknown';
    const labels = {
      method: req.method,
      route,
      status: String(res.statusCode),
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
    httpRequestsInFlight.dec();
  });

  next();
}

/**
 * Handler del endpoint /api/metrics
 */
export async function metricsHandler(_req: Request, res: Response) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end('Error al generar métricas');
  }
}
