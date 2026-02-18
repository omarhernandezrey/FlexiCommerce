'use client';

import { useState, useCallback } from 'react';
import { Product } from '@/lib/api.service';
import { useToast } from './useToast';

export interface CompareProduct extends Product {
  compareId: string; // Unique ID for this comparison session
}

export const useCompare = () => {
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [maxItems] = useState(4); // Max 4 products to compare
  const { toast } = useToast();

  // Add product to comparison
  const addToCompare = useCallback(
    (product: Product) => {
      if (products.length >= maxItems) {
        toast({ message: `Máximo ${maxItems} productos para comparar`, type: 'warning' });
        return false;
      }

      // Check if already added
      if (products.some((p) => p.id === product.id)) {
        toast({ message: 'Este producto ya está en la comparación', type: 'info' });
        return false;
      }

      const compareProduct: CompareProduct = {
        ...product,
        compareId: `comp_${product.id}_${Date.now()}`,
      };

      setProducts((prev) => [...prev, compareProduct]);
      toast({ message: `${product.name} agregado a la comparación`, type: 'success' });
      return true;
    },
    [products, maxItems, toast]
  );

  // Remove product from comparison
  const removeFromCompare = useCallback(
    (compareId: string, productName: string) => {
      setProducts((prev) => prev.filter((p) => p.compareId !== compareId));
      toast({ message: `${productName} removido de la comparación`, type: 'success' });
    },
    [toast]
  );

  // Check if product is being compared
  const isInCompare = useCallback(
    (productId: string) => {
      return products.some((p) => p.id === productId);
    },
    [products]
  );

  // Clear comparison
  const clearCompare = useCallback(() => {
    setProducts([]);
    toast({ message: 'Comparación vaciada', type: 'success' });
  }, [toast]);

  // Get specifications for all products
  const getSpecifications = useCallback(() => {
    if (products.length === 0) return {};

    // Extract all unique specification keys
    const specs = new Set<string>();
    products.forEach((product) => {
      ['price', 'stock', 'category', 'rating'].forEach((key) => {
        specs.add(key);
      });
    });

    return Array.from(specs);
  }, [products]);

  // Compare feature
  const canAddMore = useCallback(() => {
    return products.length < maxItems;
  }, [products.length, maxItems]);

  return {
    products,
    loading: false,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    getSpecifications,
    count: products.length,
    maxItems,
    canAddMore: canAddMore(),
  };
};
