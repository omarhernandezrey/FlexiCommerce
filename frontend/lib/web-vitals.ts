/**
 * Web Vitals reporting para D5-01 — Monitoring
 * Reporta LCP, FID, CLS, FCP, TTFB al backend de analytics o a la consola
 */

type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds para Core Web Vitals (Google 2024)
const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },   // ms
  FID: { good: 100, poor: 300 },     // ms
  CLS: { good: 0.1, poor: 0.25 },   // score
  FCP: { good: 1800, poor: 3000 },   // ms
  INP: { good: 200, poor: 500 },     // ms
  TTFB: { good: 800, poor: 1800 },   // ms
};

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Enviar métricas al endpoint de analytics (opcional)
 */
async function sendToAnalytics(metric: WebVitalMetric) {
  const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL;

  if (analyticsUrl) {
    try {
      await fetch(`${analyticsUrl}/web-vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          rating: metric.rating,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      });
    } catch {
      // Silently fail — no queremos que errores de analytics afecten al usuario
    }
  }

  // Siempre loggear en desarrollo
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} Web Vital: ${metric.name} = ${metric.value.toFixed(2)} (${metric.rating})`);
  }
}

/**
 * Reportar Web Vitals usando la API nativa del navegador
 * Compatible con Next.js 14 App Router
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  // PerformanceObserver para LCP, FCP, FID, INP
  const observeMetric = (type: string, callback: (entry: any) => void) => {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type, buffered: true });
    } catch {
      // Browser might not support this metric
    }
  };

  // LCP — Largest Contentful Paint
  observeMetric('largest-contentful-paint', (entry: any) => {
    const metric: WebVitalMetric = {
      name: 'LCP',
      value: entry.startTime,
      rating: getRating('LCP', entry.startTime),
      delta: entry.startTime,
      id: 'lcp',
    };
    sendToAnalytics(metric);
  });

  // CLS — Cumulative Layout Shift
  let clsValue = 0;
  observeMetric('layout-shift', (entry: any) => {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      const metric: WebVitalMetric = {
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        delta: entry.value,
        id: 'cls',
      };
      sendToAnalytics(metric);
    }
  });

  // FCP — First Contentful Paint
  observeMetric('paint', (entry: any) => {
    if (entry.name === 'first-contentful-paint') {
      const metric: WebVitalMetric = {
        name: 'FCP',
        value: entry.startTime,
        rating: getRating('FCP', entry.startTime),
        delta: entry.startTime,
        id: 'fcp',
      };
      sendToAnalytics(metric);
    }
  });

  // TTFB — Time to First Byte
  observeMetric('navigation', (entry: any) => {
    const ttfb = entry.responseStart - entry.requestStart;
    const metric: WebVitalMetric = {
      name: 'TTFB',
      value: ttfb,
      rating: getRating('TTFB', ttfb),
      delta: ttfb,
      id: 'ttfb',
    };
    sendToAnalytics(metric);
  });
}
