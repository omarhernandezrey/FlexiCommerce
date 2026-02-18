'use client';

import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import apiClient from '@/lib/api-client';

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  category: string;
  addedAt: string;
}

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/wishlist');
      setItems(response.data || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to wishlist
  const addToWishlist = useCallback(
    async (productId: string, productName: string, price: number, image: string, category: string) => {
      try {
        setLoading(true);
        await apiClient.post('/wishlist', {
          productId,
          productName,
          price,
          image,
          category,
        });
        setItems((prev) => [
          ...prev,
          {
            id: `wish_${Date.now()}`,
            productId,
            productName,
            price,
            image,
            category,
            addedAt: new Date().toISOString(),
          },
        ]);
        toast({ message: `${productName} agregado a la lista de deseos`, type: 'success' });
        return true;
      } catch (error) {
        toast({ message: 'Error al agregar a la lista de deseos', type: 'error' });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Remove from wishlist
  const removeFromWishlist = useCallback(
    async (wishlistId: string, productName: string) => {
      try {
        setLoading(true);
        await apiClient.delete(`/wishlist/${wishlistId}`);
        setItems((prev) => prev.filter((item) => item.id !== wishlistId));
        toast({ message: `${productName} removido de la lista de deseos`, type: 'success' });
        return true;
      } catch (error) {
        toast({ message: 'Error al remover de la lista de deseos', type: 'error' });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    try {
      setLoading(true);
      await apiClient.delete('/wishlist');
      setItems([]);
      toast({ message: 'Lista de deseos vaciada', type: 'success' });
      return true;
    } catch (error) {
      toast({ message: 'Error al vaciar lista de deseos', type: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    items,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    count: items.length,
  };
};
