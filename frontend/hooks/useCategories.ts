'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount: number;
  children: { id: string; name: string; slug: string; productCount: number }[];
}

let cachedCategories: Category[] | null = null;
let fetchPromise: Promise<Category[]> | null = null;

function parseCategories(raw: any[]): Category[] {
  return raw.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    description: c.description,
    productCount: c._count?.products ?? 0,
    children: (c.children || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      slug: ch.slug,
      productCount: ch._count?.products ?? 0,
    })),
  }));
}

async function fetchCategoriesOnce(): Promise<Category[]> {
  if (cachedCategories) return cachedCategories;
  if (fetchPromise) return fetchPromise;

  fetchPromise = apiClient
    .get('/api/categories')
    .then((res) => {
      const raw = (res.data as any)?.data ?? res.data;
      if (!Array.isArray(raw)) return [];
      const cats = parseCategories(raw);
      cachedCategories = cats;
      return cats;
    })
    .catch(() => {
      return [] as Category[];
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function invalidateCategoriesCache() {
  cachedCategories = null;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      invalidateCategoriesCache();
      const cats = await fetchCategoriesOnce();
      setCategories(cats);
    } catch {
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCategoriesOnce().then((cats) => {
      if (!cancelled) {
        setCategories(cats);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setError('Error al cargar categorías');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error, refresh };
}
