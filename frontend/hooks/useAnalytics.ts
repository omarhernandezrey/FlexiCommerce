'use client';

import { useState, useCallback, useRef } from 'react';
import apiClient from '@/lib/api-client';

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  ordersPerCustomer: number;
}

export interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

export interface ProductSales {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  trend: number;
}

export interface AnalyticsState {
  metrics: SalesMetrics | null;
  dailySales: DailySales[];
  topProducts: ProductSales[];
  loading: boolean;
  error: string | null;
  dateRange: { startDate: string; endDate: string };
}

const getInitialDateRange = () => ({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
});

export function useAnalytics() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRangeState] = useState(getInitialDateRange);

  // Ref para leer dateRange dentro de callbacks sin recrearlos
  const dateRangeRef = useRef(dateRange);
  dateRangeRef.current = dateRange;

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dr = dateRangeRef.current;
      const response = await apiClient.get('/api/analytics/metrics', {
        params: { startDate: dr.startDate, endDate: dr.endDate },
      });
      const data = (response.data as any)?.data ?? response.data;
      // Normalizar: backend envía conversionRate, frontend lo muestra como ordersPerCustomer
      setMetrics({
        totalSales: Number(data.totalSales) || 0,
        totalOrders: Number(data.totalOrders) || 0,
        averageOrderValue: Number(data.averageOrderValue) || 0,
        totalCustomers: Number(data.totalCustomers) || 0,
        ordersPerCustomer: Number(data.conversionRate ?? data.ordersPerCustomer) || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailySales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dr = dateRangeRef.current;
      const response = await apiClient.get('/api/analytics/daily-sales', {
        params: { startDate: dr.startDate, endDate: dr.endDate },
      });
      const raw = (response.data as any)?.data ?? response.data;
      setDailySales(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas diarias');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dr = dateRangeRef.current;
      const response = await apiClient.get('/api/analytics/top-products', {
        params: { startDate: dr.startDate, endDate: dr.endDate, limit: 10 },
      });
      const raw = (response.data as any)?.data ?? response.data;
      setTopProducts(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos top');
    } finally {
      setLoading(false);
    }
  }, []);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setDateRangeState({ startDate, endDate });
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'pdf' = 'csv') => {
    const dr = dateRangeRef.current;
    // El endpoint /export-pdf ahora devuelve texto plano (.txt)
    const endpoint = format === 'pdf' ? '/api/analytics/export-pdf' : '/api/analytics/export-csv';
    const ext = format === 'pdf' ? 'txt' : 'csv';
    const mime = format === 'pdf' ? 'text/plain' : 'text/csv';

    const response = await apiClient.get(endpoint, {
      params: { startDate: dr.startDate, endDate: dr.endDate },
      responseType: 'text',
    });

    const blob = new Blob([response.data], { type: `${mime}; charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-analytics-${dr.startDate}_${dr.endDate}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  return {
    metrics,
    dailySales,
    topProducts,
    loading,
    error,
    dateRange,
    fetchMetrics,
    fetchDailySales,
    fetchTopProducts,
    setDateRange,
    exportReport,
  };
}
