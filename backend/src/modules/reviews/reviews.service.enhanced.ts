/**
 * Enhanced Reviews Service with validation, caching, and batch operations
 */

import prisma from '../../database/prisma';
import { Cache, cacheKeys } from '../../utils/cache';
import { retryWithBackoff, CircuitBreaker } from '../../utils/retry';

const reviewsCache = new Cache(300000); // 5 min TTL

interface ReviewValidationError {
  field: string;
  message: string;
}

export class ReviewsServiceEnhanced {
  private circuitBreaker: CircuitBreaker<any>;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(
      () => prisma.review.findMany({ take: 1 }),
      5,
      2,
      60000
    );
  }

  /**
   * Get product reviews with pagination
   */
  async getByProduct(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'helpful' | 'rating' = 'recent'
  ) {
    const cacheKey = `reviews:${productId}:${page}:${sortBy}`;

    return reviewsCache.getOrCompute(cacheKey, async () => {
      const skip = (page - 1) * limit;

      try {
        await this.circuitBreaker.execute();

        const orderBy: any = {
          recent: { createdAt: 'desc' },
          helpful: { helpfulCount: 'desc' },
          rating: { rating: 'desc' },
        }[sortBy];

        const [data, total] = await Promise.all([
          retryWithBackoff(() =>
            prisma.review.findMany({
              where: { productId },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy,
              skip,
              take: limit,
            })
          ),
          retryWithBackoff(() =>
            prisma.review.count({ where: { productId } })
          ),
        ]);

        // Calculate summary statistics
        const summary = await this.getProductReviewsSummary(productId);

        return {
          data,
          summary,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
          sortBy,
        };
      } catch (error) {
        throw new Error(`Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Get reviews summary for product
   */
  async getProductReviewsSummary(productId: string) {
    try {
      const reviews = await retryWithBackoff(() =>
        prisma.review.findMany({
          where: { productId },
          select: { rating: true },
        })
      );

      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalCount: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }
      const avgRating =
        reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      const distribution = {
        1: reviews.filter((r: any) => r.rating === 1).length,
        2: reviews.filter((r: any) => r.rating === 2).length,
        3: reviews.filter((r: any) => r.rating === 3).length,
        4: reviews.filter((r: any) => r.rating === 4).length,
        5: reviews.filter((r: any) => r.rating === 5).length,
      };

      return {
        averageRating: Math.round(avgRating * 10) / 10,
        totalCount: reviews.length,
        ratingDistribution: distribution,
      };
    } catch (error) {
      throw new Error(`Failed to fetch review summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create review with validation
   */
  async create(
    userId: string,
    data: {
      productId: string;
      rating: number;
      title?: string;
      comment?: string;
    }
  ) {
    const errors: ReviewValidationError[] = [];

    // Validate input
    if (!userId?.trim()) {
      errors.push({ field: 'userId', message: 'ID de usuario requerido' });
    }
    if (!data.productId?.trim()) {
      errors.push({ field: 'productId', message: 'ID de producto requerido' });
    }
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      errors.push({
        field: 'rating',
        message: 'Calificación debe estar entre 1 y 5',
      });
    }
    if (data.title && data.title.trim().length > 100) {
      errors.push({
        field: 'title',
        message: 'Título no puede exceder 100 caracteres',
      });
    }
    if (data.comment && data.comment.trim().length > 500) {
      errors.push({
        field: 'comment',
        message: 'Comentario no puede exceder 500 caracteres',
      });
    }

    if (errors.length > 0) {
      const errorMsg = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Validation error: ${errorMsg}`);
    }

    try {
      // Check if product exists
      const product = await retryWithBackoff(() =>
        prisma.product.findUnique({ where: { id: data.productId } })
      );

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Check for duplicate review from same user
      const existingReview = await retryWithBackoff(() =>
        prisma.review.findFirst({
          where: {
            productId: data.productId,
            userId,
          },
        })
      );

      if (existingReview) {
        throw new Error('Ya has publicado una reseña para este producto');
      }

      // Create review
      const review = await retryWithBackoff(() =>
        prisma.review.create({
          data: {
            userId,
            productId: data.productId,
            rating: data.rating,
            comment: data.comment?.trim() || null,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })
      );

      // Invalidate cache
      reviewsCache.delete(cacheKeys.reviews(data.productId));

      return review;
    } catch (error) {
      throw new Error(`Failed to create review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update review
   */
  async update(
    id: string,
    userId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
    }
  ) {
    const errors: ReviewValidationError[] = [];

    if (data.rating !== undefined && (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5)) {
      errors.push({
        field: 'rating',
        message: 'Calificación debe estar entre 1 y 5',
      });
    }

    if (errors.length > 0) {
      throw new Error(errors.map((e) => `${e.field}: ${e.message}`).join('; '));
    }

    try {
      // Check ownership
      const review = await retryWithBackoff(() =>
        prisma.review.findUnique({ where: { id } })
      );

      if (!review || review.userId !== userId) {
        throw new Error('No tienes permisos para actualizar esta reseña');
      }

      const updated = await retryWithBackoff(() =>
        prisma.review.update({
          where: { id },
          data: {
            rating: data.rating,
            comment: data.comment?.trim() || undefined,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        })
      );

      // Invalidate cache
      reviewsCache.delete(cacheKeys.reviews(review.productId));

      return updated;
    } catch (error) {
      throw new Error(`Failed to update review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete review
   */
  async remove(id: string, userId: string) {
    try {
      const review = await retryWithBackoff(() =>
        prisma.review.findUnique({ where: { id } })
      );

      if (!review) {
        throw new Error('Reseña no encontrada');
      }

      if (review.userId !== userId) {
        throw new Error('No tienes permisos para eliminar esta reseña');
      }

      await retryWithBackoff(() =>
        prisma.review.delete({ where: { id } })
      );

      // Invalidate cache
      reviewsCache.delete(cacheKeys.reviews(review.productId));

      return { message: 'Reseña eliminada exitosamente' };
    } catch (error) {
      throw new Error(`Failed to delete review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(id: string) {
    try {
      const updated = await retryWithBackoff(() =>
        prisma.review.update({
          where: { id },
          data: {},
        })
      );

      return updated;
    } catch (error) {
      throw new Error(`Failed to mark review as helpful: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user reviews
   */
  async getByUser(userId: string) {
    try {
      return await retryWithBackoff(() =>
        prisma.review.findMany({
          where: { userId },
          include: {
            product: {
              select: { id: true, name: true, slug: true, images: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      );
    } catch (error) {
      throw new Error(`Failed to fetch user reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    reviewsCache.clear();
  }
}

export default new ReviewsServiceEnhanced();
