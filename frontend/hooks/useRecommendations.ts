'use client';

import { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: { name: string };
  avgRating: number;
  reviewCount: number;
  purchaseCount?: number;
}

export interface Carousel {
  id: string;
  title: string;
  description: string;
  products: RecommendedProduct[];
}

export const useRecommendations = (productId?: string) => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [similar, setSimilar] = useState<RecommendedProduct[]>([]);
  const [trending, setTrending] = useState<RecommendedProduct[]>([]);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(false);

  // Get personalized recommendations
  const fetchRecommendations = useCallback(async (limit = 6) => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/recommendations/personalized?limit=${limit}`
      );
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get similar products to current product
  const fetchSimilar = useCallback(
    async (pId: string, limit = 6) => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/recommendations/similar/${pId}?limit=${limit}`
        );
        setSimilar(response.data.products || []);
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get trending products
  const fetchTrending = useCallback(async (limit = 6) => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/recommendations/trending?limit=${limit}`
      );
      setTrending(response.data.products || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get carousels for home page
  const fetchCarousels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/recommendations/carousels');
      setCarousels(response.data.carousels || []);
    } catch (error) {
      console.error('Error fetching carousels:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load similar products if productId changes
  useEffect(() => {
    if (productId) {
      fetchSimilar(productId);
    }
  }, [productId, fetchSimilar]);

  return {
    recommendations,
    similar,
    trending,
    carousels,
    loading,
    fetchRecommendations,
    fetchSimilar,
    fetchTrending,
    fetchCarousels,
  };
};
