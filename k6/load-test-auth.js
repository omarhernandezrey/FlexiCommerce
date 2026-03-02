/**
 * k6 Auth Flow Test — Test del flujo de autenticación
 * D5-02: Medir rendimiento de login/register bajo carga
 *
 * Ejecutar: k6 run k6/load-test-auth.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const loginErrorRate = new Rate('login_errors');
const loginDuration = new Trend('login_duration');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    login_duration: ['p(95)<1000'],  // Login < 1s en p95
    login_errors: ['rate<0.05'],     // Menos del 5% de errores
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const headers = { 'Content-Type': 'application/json' };

  // Intentar login (con credenciales incorrectas para no afectar DB)
  const loginPayload = JSON.stringify({
    email: `test_${uuidv4()}@example.com`,
    password: 'WrongPassword123!',
  });

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    loginPayload,
    { headers }
  );

  // Esperamos 401 (credenciales incorrectas) o 429 (rate limited)
  const success = check(loginRes, {
    'login: responde apropiadamente': (r) =>
      r.status === 401 || r.status === 400 || r.status === 429,
    'login: no error 500': (r) => r.status !== 500,
  });

  loginErrorRate.add(!success);
  loginDuration.add(loginRes.timings.duration);

  sleep(1);
}
