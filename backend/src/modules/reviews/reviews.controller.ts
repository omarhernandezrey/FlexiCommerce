import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service.js';

export class ReviewsController {
  private service = new ReviewsService();

  getByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviews = await this.service.getByProduct(req.params.productId);
      res.json({ success: true, data: reviews });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
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
