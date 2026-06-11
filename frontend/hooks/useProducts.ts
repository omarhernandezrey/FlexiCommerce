'use client';

import { useState, useCallback } from 'react';
import { productsAPI, Product } from '@/lib/api.service';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normaliza un producto del API: convierte Decimal (string de Prisma) a number
  // y aplana campos relacionados (category puede ser objeto con include: { category: true })
  const normalizeProduct = (p: any): Product => {
    const reviews = Array.isArray(p.reviews) ? p.reviews : [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating ?? 0), 0) / reviews.length
      : (p.rating != null ? Number(p.rating) : 0);

    return {
      ...p,
      price: Number(p.price ?? 0),
      originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
      rating: Math.round(avgRating * 10) / 10,
      reviews: Array.isArray(p.reviews) ? p.reviews.length : (p.reviews ?? 0),
      image: p.image ?? (Array.isArray(p.images) ? p.images[0] : undefined) ?? '',
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      category: typeof p.category === 'object' && p.category !== null ? p.category.name : (p.category ?? ''),
      stock: Number(p.stock ?? 0),
      isFeatured: p.isFeatured ?? false,
    };
  };

  const fetchAll = useCallback(
    async (params?: Parameters<typeof productsAPI.getAll>[0]) => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsAPI.getAll(params);
        // El backend envuelve: { success, data: [...], pagination: {...} }
        const rawProducts = response.data?.data ?? response.data ?? [];
        const products = (Array.isArray(rawProducts) ? rawProducts : []).map(normalizeProduct);
        setProducts(products);
        return products;
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
      const raw = response.data.data || response.data;
      return raw ? normalizeProduct(raw) : raw;
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
      const rawProducts = response.data?.data ?? response.data ?? [];
      const products = (Array.isArray(rawProducts) ? rawProducts : []).map(normalizeProduct);
      setProducts(products);
      return products;
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
