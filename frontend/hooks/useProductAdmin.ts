'use client';

import { useCallback, useState } from 'react';
import apiClient from '@/lib/api-client';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
}

export interface AdminProductsResult {
  data: AdminProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: 'active' | 'inactive' | 'all';
  stock?: 'in' | 'low' | 'out';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface State {
  product: AdminProduct | null;
  products: AdminProduct[];
  pagination: AdminProductsResult['pagination'] | null;
  stats: ProductStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initial: State = {
  product: null,
  products: [],
  pagination: null,
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
};

const normalize = (p: any): AdminProduct => ({
  ...p,
  price: Number(p.price ?? 0),
  isActive: p.isActive !== undefined ? Boolean(p.isActive) : Boolean(p.is_active ?? true),
  images: Array.isArray(p.images) ? p.images : [],
  category:
    typeof p.category === 'object' && p.category !== null ? p.category : undefined,
});

export function useProductAdmin() {
  const [state, setState] = useState<State>(initial);

  // ─── Listar (modo admin) ───────────────────────────────────────────────────
  const fetchAll = useCallback(async (params: AdminListParams = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/api/products', {
        params: { ...params, admin: 'true', limit: params.limit ?? 20 },
      });
      const body = response.data as any;
      const products = (Array.isArray(body.data) ? body.data : []).map(normalize);
      const pagination = body.pagination ?? null;

      // Si la página actual quedó vacía y hay páginas anteriores, ajustar
      const safeProducts = products;
      setState((prev) => ({ ...prev, products: safeProducts, pagination, loading: false }));
      return { products: safeProducts, pagination };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al listar productos';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  // ─── Estadísticas ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, statsLoading: true }));
    try {
      const response = await apiClient.get('/api/products/stats');
      const stats = (response.data as any)?.data ?? null;
      setState((prev) => ({ ...prev, stats, statsLoading: false }));
      return stats as ProductStats;
    } catch {
      setState((prev) => ({ ...prev, statsLoading: false }));
      return null;
    }
  }, []);

  // ─── Obtener uno ───────────────────────────────────────────────────────────
  const fetchById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      const data = normalize((response.data as any)?.data ?? response.data);
      setState((prev) => ({ ...prev, product: data, loading: false }));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar el producto';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  // ─── Crear ────────────────────────────────────────────────────────────────
  const create = useCallback(async (data: Partial<AdminProduct>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.post('/api/products', data);
      const result = normalize((response.data as any)?.data ?? response.data);
      setState((prev) => ({ ...prev, product: result, loading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear producto';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  // ─── Actualizar ───────────────────────────────────────────────────────────
  const update = useCallback(async (id: string, data: Partial<AdminProduct>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.put(`/api/products/${id}`, data);
      const result = normalize((response.data as any)?.data ?? response.data);
      setState((prev) => ({ ...prev, product: result, loading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar producto';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, []);

  // ─── Eliminar (solo API — la página hace refetch) ──────────────────────────
  const deleteProduct = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/api/products/${id}`);
      // NO actualización optimista — la página llama fetchAll() después
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // ─── Toggle estado individual (solo API) ───────────────────────────────────
  const toggleStatus = useCallback(async (id: string) => {
    try {
      const response = await apiClient.patch(`/api/products/${id}/toggle-status`);
      return normalize((response.data as any)?.data ?? response.data);
      // NO actualización optimista — la página llama fetchAll() después
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar estado';
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // ─── Duplicar (solo API) ───────────────────────────────────────────────────
  const duplicate = useCallback(async (id: string) => {
    try {
      const response = await apiClient.post(`/api/products/${id}/duplicate`);
      return normalize((response.data as any)?.data ?? response.data);
      // NO actualización optimista — la página llama fetchAll() después
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al duplicar producto';
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // ─── Eliminar masivo (solo API) ────────────────────────────────────────────
  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      await apiClient.post('/api/products/bulk/delete', { ids });
      // NO actualización optimista — la página llama fetchAll() después
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar productos';
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // ─── Purgar todos los inactivos definitivamente ────────────────────────────
  const purgeInactive = useCallback(async () => {
    try {
      const response = await apiClient.post('/api/products/purge-inactive');
      return (response.data as any)?.purged ?? 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al purgar inactivos';
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // ─── Toggle estado masivo (solo API) ──────────────────────────────────────
  const bulkToggleStatus = useCallback(async (ids: string[], isActive: boolean) => {
    try {
      await apiClient.post('/api/products/bulk/toggle-status', { ids, isActive });
      // NO actualización optimista — la página llama fetchAll() después
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar estado';
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  return {
    ...state,
    fetchAll,
    fetchStats,
    fetchById,
    create,
    update,
    deleteProduct,
    toggleStatus,
    duplicate,
    bulkDelete,
    bulkToggleStatus,
    purgeInactive,
  };
}
