/**
 * k6 Load Test — Carga Normal
 * D5-02: 100 usuarios concurrentes durante 5 minutos
 *
 * Ejecutar: k6 run k6/load-test-normal.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const productListDuration = new Trend('product_list_duration');
const productDetailDuration = new Trend('product_detail_duration');
const searchDuration = new Trend('search_duration');

// Configuración de carga
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up a 20 usuarios en 1 min
    { duration: '3m', target: 100 },  // Ramp up a 100 usuarios en 3 min
    { duration: '1m', target: 0 },    // Ramp down a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% de requests < 2s
    http_req_failed: ['rate<0.05'],     // Error rate < 5%
    errors: ['rate<0.1'],              // Tasa de errores < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Lista de IDs de productos para tests (actualizar con IDs reales)
const PRODUCT_IDS = ['prod-1', 'prod-2', 'prod-3'];
const SEARCH_QUERIES = ['laptop', 'telefono', 'auriculares', 'tablet'];

export default function () {
  // Scenario 1: Listar productos (60% del tráfico)
  if (Math.random() < 0.6) {
    const res = http.get(`${BASE_URL}/api/products?page=1&limit=12`);
    const success = check(res, {
      'products list: status 200': (r) => r.status === 200,
      'products list: tiene datos': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data !== undefined;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!success);
    productListDuration.add(res.timings.duration);
  }

  // Scenario 2: Detalle de producto (25% del tráfico)
  if (Math.random() < 0.25) {
    const productId = PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)];
    const res = http.get(`${BASE_URL}/api/products/${productId}`);
    const success = check(res, {
      'product detail: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
    errorRate.add(!success);
    productDetailDuration.add(res.timings.duration);
  }

  // Scenario 3: Búsqueda (15% del tráfico)
  if (Math.random() < 0.15) {
    const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
    const res = http.get(`${BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`);
    const success = check(res, {
      'search: status 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
    searchDuration.add(res.timings.duration);
  }

  // Health check
  http.get(`${BASE_URL}/api/health`);

  sleep(1); // 1 segundo entre iteraciones por usuario
}
