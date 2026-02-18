import { Request, Response } from 'express';
import { RecommendationService } from './recommendations.service.js';

export class RecommendationController {
  /**
   * Get personalized recommendations for logged-in user
   * GET /api/recommendations/personalized
   */
  static async getPersonalized(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        // Return trending for non-authenticated users
        const recommendations = await RecommendationService.getTrendingProducts(6);
        return res.status(200).json({
          recommendations,
          source: 'trending',
        });
      }

      const recommendations = await RecommendationService.getRecommendations(userId, 6);
      return res.status(200).json({
        recommendations,
        source: 'personalized',
      });
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return res.status(500).json({ message: 'Error al obtener recomendaciones' });
    }
  }

  /**
   * Get similar products to a given product
   * GET /api/recommendations/similar/:productId
   */
  static async getSimilar(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const similar = await RecommendationService.getSimilarProducts(productId, 6);
      return res.status(200).json({ products: similar });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener productos similares';
      return res.status(500).json({ message });
    }
  }

  /**
   * Get trending products
   * GET /api/recommendations/trending
   */
  static async getTrending(req: Request, res: Response) {
    try {
      const { limit = 6 } = req.query;

      const trending = await RecommendationService.getTrendingProducts(parseInt(limit as string));
      return res.status(200).json({ products: trending });
    } catch (error) {
      console.error('Error getting trending products:', error);
      return res.status(500).json({ message: 'Error al obtener productos en tendencia' });
    }
  }

  /**
   * Get personalized carousels for home page
   * GET /api/recommendations/carousels
   */
  static async getCarousels(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const carousels = await RecommendationService.getPersonalizedCarousels(userId);
      return res.status(200).json({ carousels });
    } catch (error) {
      console.error('Error getting carousels:', error);
      return res.status(500).json({ message: 'Error al obtener carruseles' });
    }
  }
}
