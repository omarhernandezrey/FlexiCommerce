/**
 * Enhanced Products Service with caching, batch operations, and error handling
 */

import prisma from '../../database/prisma';
import { Prisma } from '@prisma/client';
import { Cache, cacheKeys } from '../../utils/cache';
import { batchGet } from '../../utils/batch';
import { retryWithBackoff, CircuitBreaker } from '../../utils/retry';

const productCache = new Cache(300000); // 5 min TTL

export class ProductsServiceEnhanced {
  private circuitBreaker: CircuitBreaker<any>;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(
      () => prisma.product.findMany({ take: 1 }),
      5, // Failure threshold
      2, // Success threshold
      60000 // Reset timeout
    );
  }

  /**
   * Get all products with pagination and optional filtering
   */
  async getAll(page: number = 1, limit: number = 10, categoryId?: string) {
    const cacheKey = cacheKeys.products(page, limit, categoryId);

    return productCache.getOrCompute(cacheKey, async () => {
      const skip = (page - 1) * limit;
      const where = categoryId
        ? { categoryId, isActive: true }
        : { isActive: true };

      try {
        await this.circuitBreaker.execute();

        const [data, total] = await Promise.all([
          retryWithBackoff(() =>
            prisma.product.findMany({
              where,
              skip,
              take: limit,
              include: { category: true, _count: { select: { reviews: true } } },
              orderBy: { createdAt: 'desc' },
            })
          ),
          retryWithBackoff(() => prisma.product.count({ where })),
        ]);

        return {
          data: data.map((p: any) => ({
            ...p,
            reviewCount: p._count.reviews,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      } catch (error) {
        throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Get single product by ID
   */
  async getById(id: string) {
    const cacheKey = cacheKeys.product(id);

    return productCache.getOrCompute(cacheKey, async () => {
      try {
        const product = await retryWithBackoff(() =>
          prisma.product.findUnique({
            where: { id },
            include: {
              category: true,
              reviews: {
                include: { user: { select: { firstName: true, lastName: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
              _count: { select: { reviews: true } },
            },
          })
        );

        if (!product) {
          throw new Error('Producto no encontrado');
        }

        const avgRating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
            : 0;

        return {
          ...product,
          reviewCount: product._count.reviews,
          averageRating: Math.round(avgRating * 10) / 10,
        };
      } catch (error) {
        throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Get multiple products by IDs (batch operation)
   */
  async getByIds(ids: string[]) {
    try {
      return await batchGet(ids, async (batchIds: string[]) => {
        return retryWithBackoff(() =>
          prisma.product.findMany({
            where: { id: { in: batchIds }, isActive: true },
            include: { category: true, _count: { select: { reviews: true } } },
          })
        );
      });
    } catch (error) {
      throw new Error(`Failed to batch fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search products with optimal query
   */
  async search(query: string, page: number = 1, limit: number = 10, filters?: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    categoryId?: string;
  }) {
    const cacheKey = cacheKeys.search(query, page);

    return productCache.getOrCompute(cacheKey, async () => {
      const skip = (page - 1) * limit;

      const where: Prisma.ProductWhereInput = {
        isActive: true,
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.minPrice !== undefined && { price: { gte: filters.minPrice } }),
        ...(filters?.maxPrice !== undefined && {
          price: { ...(filters?.minPrice && { gte: filters.minPrice }), lte: filters.maxPrice },
        }),
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      };

      try {
        const [data, total] = await Promise.all([
          retryWithBackoff(() =>
            prisma.product.findMany({
              where,
              skip,
              take: limit,
              include: { category: true, _count: { select: { reviews: true } } },
              orderBy: { createdAt: 'desc' },
            })
          ),
          retryWithBackoff(() => prisma.product.count({ where })),
        ]);

        return {
          data: data.map((p: any) => ({
            ...p,
            reviewCount: p._count.reviews,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
          },
          query,
        };
      } catch (error) {
        throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Create product
   */
  async create(data: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
  }) {
    try {
      // Validate input
      if (!data.name?.trim()) throw new Error('Nombre de producto requerido');
      if (data.price < 0) throw new Error('El precio debe ser positivo');
      if (data.stock < 0) throw new Error('El stock debe ser no negativo');

      const product = await retryWithBackoff(() =>
        prisma.product.create({ data })
      );

      // Invalidate cache
      productCache.invalidate('products');

      return product;
    } catch (error) {
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update product
   */
  async update(id: string, data: Record<string, unknown>) {
    try {
      if (data.price !== undefined && (data.price as number) < 0) {
        throw new Error('El precio debe ser positivo');
      }

      const product = await retryWithBackoff(() =>
        prisma.product.update({ where: { id }, data })
      );

      // Invalidate cache
      productCache.delete(cacheKeys.product(id));
      productCache.invalidate('products');

      return product;
    } catch (error) {
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Soft delete (isActive = false)
   */
  async remove(id: string) {
    try {
      const product = await retryWithBackoff(() =>
        prisma.product.update({
          where: { id },
          data: { isActive: false },
        })
      );

      // Invalidate cache
      productCache.delete(cacheKeys.product(id));
      productCache.invalidate('products');

      return product;
    } catch (error) {
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get featured products
   */
  async getFeatured(limit: number = 6) {
    const cacheKey = 'featured-products';

    return productCache.getOrCompute(cacheKey, async () => {
      try {
        return await retryWithBackoff(() =>
          prisma.product.findMany({
            where: { isActive: true },
            take: limit,
            include: { category: true, _count: { select: { reviews: true } } },
            orderBy: { createdAt: 'desc' },
          })
        );
      } catch (error) {
        throw new Error(`Failed to fetch featured products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Get products by category (batch)
   */
  async getByCategory(categoryId: string, limit: number = 20) {
    const cacheKey = `products-by-category:${categoryId}`;

    return productCache.getOrCompute(cacheKey, async () => {
      try {
        return await retryWithBackoff(() =>
          prisma.product.findMany({
            where: { categoryId, isActive: true },
            take: limit,
            include: { category: true, _count: { select: { reviews: true } } },
            orderBy: { createdAt: 'desc' },
          })
        );
      } catch (error) {
        throw new Error(`Failed to fetch category products: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Clear all caches (useful after bulk operations)
   */
  clearCache() {
    productCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: productCache.size(),
      message: 'Cache statistics',
    };
  }
}

export default new ProductsServiceEnhanced();
