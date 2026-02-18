'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
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

const initialState: AnalyticsState = {
  metrics: null,
  dailySales: [],
  topProducts: [],
  loading: false,
  error: null,
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
};

export function useAnalytics() {
  const [state, setState] = useState<AnalyticsState>(initialState);

  const fetchMetrics = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/api/analytics/metrics', {
        params: {
          startDate: state.dateRange.startDate,
          endDate: state.dateRange.endDate,
        },
      });
      setState((prev) => ({
        ...prev,
        metrics: response.data,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error fetching metrics',
        loading: false,
      }));
    }
  }, [state.dateRange]);

  const fetchDailySales = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/api/analytics/daily-sales', {
        params: {
          startDate: state.dateRange.startDate,
          endDate: state.dateRange.endDate,
        },
      });
      setState((prev) => ({
        ...prev,
        dailySales: response.data,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error fetching sales data',
        loading: false,
      }));
    }
  }, [state.dateRange]);

  const fetchTopProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/api/analytics/top-products', {
        params: {
          startDate: state.dateRange.startDate,
          endDate: state.dateRange.endDate,
          limit: 10,
        },
      });
      setState((prev) => ({
        ...prev,
        topProducts: response.data,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error fetching top products',
        loading: false,
      }));
    }
  }, [state.dateRange]);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setState((prev) => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      const response = await apiClient.get(`/api/analytics/export-${format}`, {
        params: {
          startDate: state.dateRange.startDate,
          endDate: state.dateRange.endDate,
        },
        responseType: format === 'pdf' ? 'arraybuffer' : 'text',
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }, [state.dateRange]);

  return {
    ...state,
    fetchMetrics,
    fetchDailySales,
    fetchTopProducts,
    setDateRange,
    exportReport,
  };
}
