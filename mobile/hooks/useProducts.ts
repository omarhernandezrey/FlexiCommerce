import { useState, useCallback, useEffect } from 'react';
import { productService, recommendationService } from '../lib/services';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: { id: string; name: string };
  avgRating: number;
  reviewCount: number;
  description?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category?: string;
}

export const useProducts = (options?: UseProductsOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(options?.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState(options?.category);

  const fetchProducts = useCallback(
    async (pageNum: number = page, cat?: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProducts(pageNum, 10, cat || category);
        setProducts(response.data.products);
        setTotalPages(response.data.pages);
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    },
    [page, category]
  );

  const searchProducts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.searchProducts(query);
      setProducts(response.data.products);
      setTotalPages(1);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Error searching products');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByCategory = useCallback((cat: string) => {
    setCategory(cat);
    setPage(1);
    fetchProducts(1, cat);
  }, [fetchProducts]);

  const goToPage = useCallback(
    (pageNum: number) => {
      fetchProducts(pageNum, category);
    },
    [fetchProducts, category]
  );

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return {
    products,
    loading,
    error,
    page,
    totalPages,
    category,
    fetchProducts,
    searchProducts,
    filterByCategory,
    goToPage,
  };
};

export const useProductDetail = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details and similar products in parallel
        const [productRes, similarRes] = await Promise.all([
          productService.getProduct(productId),
          recommendationService.getSimilar(productId),
        ]);

        setProduct(productRes.data);
        setSimilar(similarRes.data.products);
      } catch (err: any) {
        setError(err.message || 'Error loading product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  return {
    product,
    similar,
    loading,
    error,
  };
};
