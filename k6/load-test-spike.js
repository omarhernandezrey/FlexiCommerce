/**
 * k6 Spike Test — Pico de tráfico
 * D5-02: 1000 usuarios en 30 segundos para identificar límites
 *
 * Ejecutar: k6 run k6/load-test-spike.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '10s', target: 100 },   // Ramp up rápido
    { duration: '30s', target: 1000 },  // Spike a 1000 usuarios
    { duration: '10s', target: 100 },   // Bajar a 100
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<5000'],   // 99% de requests < 5s durante el spike
    http_req_failed: ['rate<0.2'],       // Tolerar hasta 20% de errores en spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Solo el endpoint más crítico durante el spike
  const res = http.get(`${BASE_URL}/api/products?page=1&limit=12`);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
    'duration < 5s': (r) => r.timings.duration < 5000,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);

  sleep(0.1); // Solo 100ms entre requests para simular spike real
}
