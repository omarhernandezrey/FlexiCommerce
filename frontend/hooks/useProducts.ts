'use client';

import { useState, useCallback } from 'react';
import { productsAPI, Product } from '@/lib/api.service';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (params?: Parameters<typeof productsAPI.getAll>[0]) => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getAll(params);
        const data = response.data;
        setProducts(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error fetching products';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getById(id);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching product';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.search(query);
      const data = response.data;
      setProducts(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error searching products';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchAll,
    fetchById,
    search,
  };
};
