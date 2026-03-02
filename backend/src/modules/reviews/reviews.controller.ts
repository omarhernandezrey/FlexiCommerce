import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service.js';

export class ReviewsController {
  private service = new ReviewsService();

  getByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await this.service.getByProduct(req.params.productId, page, limit);
      res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getStats(req.params.productId);
      res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';
      res.status(500).json({ success: false, error: message });
    }
  };

  checkUserReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.checkUserReview(req.params.productId, req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al verificar reseña';
      res.status(500).json({ success: false, error: message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const review = await this.service.create(req.user.id, req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear reseña';
      res.status(400).json({ success: false, error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const review = await this.service.update(req.params.id, req.user.id, req.body);
      res.json({ success: true, data: review });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar reseña';
      res.status(400).json({ success: false, error: message });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(req.params.id, req.user.id);
      res.json({ success: true, message: 'Reseña eliminada' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar reseña';
      res.status(400).json({ success: false, error: message });
    }
  };
}
