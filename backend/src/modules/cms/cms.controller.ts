import { Request, Response } from 'express';
import { CmsService } from './cms.service.js';

export class CmsController {
  private service = new CmsService();

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pages = await this.service.getAll();
      res.json({ success: true, data: pages });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = await this.service.getBySlug(req.params.slug);
      if (!page) {
        res.status(404).json({ success: false, error: 'Página no encontrada' });
        return;
      }
      res.json({ success: true, data: page });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = await this.service.create(req.body);
      res.status(201).json({ success: true, data: page });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear página';
      res.status(400).json({ success: false, error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: page });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      res.status(400).json({ success: false, error: message });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(req.params.id);
      res.json({ success: true, message: 'Página eliminada' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      res.status(400).json({ success: false, error: message });
    }
  };
}
