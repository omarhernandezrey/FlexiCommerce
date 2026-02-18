import { useEffect, useState } from 'react';
import { useWishlistStore } from '../store/wishlist';
import { productService } from '../lib/services';

interface WishlistItemWithProduct {
  id: string;
  productId: string;
  product: any;
  addedAt: string;
}

export const useWishlist = () => {
  const { items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist } = useWishlistStore();
  const [itemsWithProducts, setItemsWithProducts] = useState<WishlistItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (items.length === 0) {
        setItemsWithProducts([]);
        return;
      }

      try {
        setLoading(true);
        const productsData = await Promise.all(
          items.map(async (item) => {
            try {
              const response = await productService.getProduct(item.productId);
              return {
                ...item,
                product: response.data,
              };
            } catch (err) {
              console.error(`Error loading product ${item.productId}:`, err);
              return null;
            }
          })
        );
        setItemsWithProducts(productsData.filter((item) => item !== null) as WishlistItemWithProduct[]);
      } catch (err) {
        console.error('Error loading wishlist products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistProducts();
  }, [items]);

  return {
    items: itemsWithProducts,
    loading,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    clearWishlist,
    count: items.length,
  };
};
