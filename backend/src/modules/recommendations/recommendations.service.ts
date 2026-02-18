import prisma from '../../database/prisma.js';

// Simple cosine similarity for ML recommendations
export class RecommendationService {
  /**
   * Get product recommendations based on:
   * 1. User's browsing/purchase history
   * 2. Similar product categories
   * 3. Top-rated products
   */
  static async getRecommendations(userId: string, limit = 6) {
    try {
      // Get user's order history (products purchased)
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      });

      // Get categories from purchased products
      const purchasedCategoryIds = new Set<string>();
      const purchasedProductIds = new Set<string>();

      userOrders.forEach((order) => {
        order.items.forEach((item) => {
          purchasedProductIds.add(item.product.id);
          if (item.product.categoryId) {
            purchasedCategoryIds.add(item.product.categoryId);
          }
        });
      });

      // Get top-rated products that user hasn't purchased
      const recommendedProducts = await prisma.product.findMany({
        where: {
          id: {
            notIn: Array.from(purchasedProductIds),
          },
          OR: [
            { categoryId: { in: Array.from(purchasedCategoryIds) } },
            {}, // Also get top-rated products regardless of category
          ],
        },
        include: {
          category: true,
          reviews: {
            select: { rating: true },
          },
        },
        take: limit * 2, // Get extra to filter down
      });

      // Score products based on:
      // 1. Average rating (40% weight)
      // 2. Review count (30% weight)
      // 3. Category match (30% weight)
      const scoredProducts = recommendedProducts.map((product) => {
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0;

        const ratingScore = (avgRating / 5) * 0.4; // 0-0.4
        const reviewScore = Math.min(product.reviews.length / 100, 1) * 0.3; // 0-0.3
        const categoryScore = purchasedCategoryIds.has(product.categoryId) ? 0.3 : 0.1; // 0.1-0.3

        return {
          ...product,
          score: ratingScore + reviewScore + categoryScore,
        };
      });

      // Sort by score and return top products
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, reviews, ...product }) => ({
          ...product,
          avgRating: reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
            : 0,
          reviewCount: reviews.length,
        }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Get trending products (most viewed/purchased recently)
   */
  static async getTrendingProducts(limit = 6) {
    try {
      // Get products from recent orders
      const trendingProducts = await prisma.product.findMany({
        include: {
          category: true,
          reviews: {
            select: { rating: true },
            take: 100,
          },
          orderItems: {
            take: 10,
          },
        },
        orderBy: {
          orderItems: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      return trendingProducts.map(({ reviews, orderItems, ...product }) => ({
        ...product,
        avgRating: reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : 0,
        reviewCount: reviews.length,
        purchaseCount: orderItems.length,
      }));
    } catch (error) {
      console.error('Error getting trending products:', error);
      throw error;
    }
  }

  /**
   * Get products similar to a given product
   */
  static async getSimilarProducts(productId: string, limit = 6) {
    try {
      // Get the reference product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          reviews: { select: { rating: true } },
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Get similar products in same category
      const similarProducts = await prisma.product.findMany({
        where: {
          id: { not: productId },
          categoryId: product.categoryId,
        },
        include: {
          category: true,
          reviews: {
            select: { rating: true },
            take: 100,
          },
        },
        take: limit,
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
      });

      return similarProducts.map(({ reviews, ...prod }) => ({
        ...prod,
        avgRating: reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : 0,
        reviewCount: reviews.length,
      }));
    } catch (error) {
      console.error('Error getting similar products:', error);
      throw error;
    }
  }

  /**
   * Get personalized carousel data for home page
   */
  static async getPersonalizedCarousels(userId?: string) {
    try {
      const carousels = [];

      // 1. Trending products (for all users)
      const trending = await this.getTrendingProducts(8);
      if (trending.length > 0) {
        carousels.push({
          id: 'trending',
          title: 'Tendencias Ahora',
          description: 'Los más vendidos esta semana',
          products: trending,
        });
      }

      // 2. Personalized recommendations (if user logged in)
      if (userId) {
        const recommendations = await this.getRecommendations(userId, 8);
        if (recommendations.length > 0) {
          carousels.push({
            id: 'personalized',
            title: 'Especial Para Ti',
            description: 'Basado en tu historial',
            products: recommendations,
          });
        }
      }

      // 3. Top rated products
      const topRated = await prisma.product.findMany({
        include: {
          category: true,
          reviews: {
            select: { rating: true },
          },
        },
        where: {
          reviews: {
            some: {},
          },
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
        take: 8,
      });

      if (topRated.length > 0) {
        const topRatedWithStats = topRated.map(({ reviews, ...product }) => ({
          ...product,
          avgRating: Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10,
          reviewCount: reviews.length,
        }));

        carousels.push({
          id: 'top-rated',
          title: 'Mejor Valorados',
          description: 'Los favoritos de nuestros clientes',
          products: topRatedWithStats,
        });
      }

      return carousels;
    } catch (error) {
      console.error('Error building personalized carousels:', error);
      return [];
    }
  }
}
