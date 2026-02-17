import { Request, Response } from 'express';
import { ProductsService } from './products.service.js';

export class ProductsController {
  private service = new ProductsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '10', category } = req.query;
      const result = await this.service.getAll(
        Number(page),
        Number(limit),
        category as string | undefined
      );
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener productos';
      res.status(500).json({ success: false, error: message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.service.getById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }
      res.json({ success: true, data: product });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener producto';
      res.status(500).json({ success: false, error: message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.service.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(req.params.id);
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, page = '1', limit = '10' } = req.query;
      
      if (!q) {
        res.status(400).json({ success: false, error: 'Parámetro de búsqueda requerido' });
        return;
      }

      const result = await this.service.search(
        q as string,
        Number(page),
        Number(limit)
      );
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al buscar productos';
      res.status(500).json({ success: false, error: message });
    }
  };
}
