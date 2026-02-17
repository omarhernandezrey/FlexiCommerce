import { Request, Response } from 'express';
import { CategoriesService } from './categories.service.js';

export class CategoriesController {
  private service = new CategoriesService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.service.getAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener categorías';
      res.status(500).json({ success: false, error: message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.service.getById(req.params.id);
      if (!category) {
        res.status(404).json({ success: false, error: 'Categoría no encontrada' });
        return;
      }
      res.json({ success: true, data: category });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.service.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear categoría';
      res.status(400).json({ success: false, error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      res.status(400).json({ success: false, error: message });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(req.params.id);
      res.json({ success: true, message: 'Categoría eliminada' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      res.status(400).json({ success: false, error: message });
    }
  };
}
