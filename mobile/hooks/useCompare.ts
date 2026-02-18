import { useEffect, useState } from 'react';
import { useCompareStore } from '../store/compare';
import { productService } from '../lib/services';

interface CompareProductData {
  id: string;
  productId: string;
  product: any;
}

export const useCompare = () => {
  const { products, addProduct, removeProduct, toggleProduct, isComparing, clearCompare, maxProducts } =
    useCompareStore();
  const [productsData, setProductsData] = useState<CompareProductData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      if (products.length === 0) {
        setProductsData([]);
        return;
      }

      try {
        setLoading(true);
        const data = await Promise.all(
          products.map(async (item) => {
            try {
              const response = await productService.getProduct(item.productId);
              return {
                id: item.id,
                productId: item.productId,
                product: response.data,
              };
            } catch (err) {
              console.error(`Error loading product ${item.productId}:`, err);
              return null;
            }
          })
        );
        setProductsData(data.filter((item) => item !== null) as CompareProductData[]);
      } catch (err) {
        console.error('Error loading compare products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [products]);

  return {
    products: productsData,
    loading,
    count: products.length,
    maxProducts,
    canAdd: products.length < maxProducts,
    addProduct,
    removeProduct,
    toggleProduct,
    isComparing,
    clearCompare,
  };
};
