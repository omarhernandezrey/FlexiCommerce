'use client';

import { useCallback, useState } from 'react';
import apiClient from '@/lib/api-client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsAdminState {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsAdminState = {
  product: null,
  loading: false,
  error: null,
};

export function useProductAdmin() {
  const [state, setState] = useState<ProductsAdminState>(initialState);

  const fetchById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get(`/products/${id}`);
      setState((prev) => ({
        ...prev,
        product: response.data,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar el producto';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const create = useCallback(async (data: Partial<Product>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.post('/products', data);
      setState((prev) => ({
        ...prev,
        product: response.data,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear producto';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Product>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.put(`/products/${id}`, data);
      setState((prev) => ({
        ...prev,
        product: response.data,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar producto';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await apiClient.delete(`/products/${id}`);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    fetchById,
    create,
    update,
    deleteProduct,
  };
}
