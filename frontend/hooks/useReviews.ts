'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from './useToast';
import apiClient from '@/lib/api-client';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReviewStats {
  count: number;
  average: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const useReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    count: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { toast } = useToast();

  // Fetch product reviews
  const fetchReviews = useCallback(
    async (page = 1, limit = 10) => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
        setReviews(response.data.reviews || []);
        return response.data;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast({ message: 'Error al cargar reviews', type: 'error' });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [productId, toast]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get(`/reviews/stats/${productId}`);
      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [productId]);

  // Check if user has already reviewed
  const checkUserReview = useCallback(async () => {
    try {
      const response = await apiClient.get(`/reviews/check/${productId}`);
      setHasUserReview(response.data.has_review);
      if (response.data.review) {
        setUserReview(response.data.review);
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  }, [productId]);

  // Create review
  const createReview = useCallback(
    async (rating: number, comment: string) => {
      try {
        setLoading(true);
        const response = await apiClient.post('/reviews', {
          productId,
          rating,
          comment: comment || null,
        });
        
        setUserReview(response.data.review);
        setHasUserReview(true);
        
        // Refresh reviews and stats
        await Promise.all([fetchReviews(), fetchStats(), checkUserReview()]);
        
        toast({ message: 'Review creado exitosamente', type: 'success' });
        return response.data.review;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al crear review';
        toast({ message, type: 'error' });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [productId, toast, fetchReviews, fetchStats, checkUserReview]
  );

  // Update review
  const updateReview = useCallback(
    async (reviewId: string, rating: number, comment: string) => {
      try {
        setLoading(true);
        const response = await apiClient.put(`/reviews/${reviewId}`, {
          rating,
          comment: comment || null,
        });

        setUserReview(response.data.review);
        
        // Refresh reviews and stats
        await Promise.all([fetchReviews(), fetchStats(), checkUserReview()]);
        
        toast({ message: 'Review actualizado exitosamente', type: 'success' });
        return response.data.review;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al actualizar review';
        toast({ message, type: 'error' });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [productId, toast, fetchReviews, fetchStats, checkUserReview]
  );

  // Delete review
  const deleteReview = useCallback(
    async (reviewId: string) => {
      try {
        setLoading(true);
        await apiClient.delete(`/reviews/${reviewId}`);
        
        setHasUserReview(false);
        setUserReview(null);
        
        // Refresh reviews and stats
        await Promise.all([fetchReviews(), fetchStats(), checkUserReview()]);
        
        toast({ message: 'Review eliminado exitosamente', type: 'success' });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al eliminar review';
        toast({ message, type: 'error' });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [productId, toast, fetchReviews, fetchStats, checkUserReview]
  );

  // Load data on mount and product change
  useEffect(() => {
    if (productId) {
      Promise.all([fetchReviews(), fetchStats(), checkUserReview()]);
    }
  }, [productId, fetchReviews, fetchStats, checkUserReview]);

  return {
    reviews,
    stats,
    loading,
    hasUserReview,
    userReview,
    fetchReviews,
    fetchStats,
    checkUserReview,
    createReview,
    updateReview,
    deleteReview,
  };
};
