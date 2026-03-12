import { Request, Response } from 'express';
import { CategoriesService } from './categories.service.js';

const ALLOWED_CREATE_FIELDS = ['name', 'slug', 'description', 'image', 'parentId', 'isActive'] as const;
const ALLOWED_UPDATE_FIELDS = ['name', 'slug', 'description', 'image', 'parentId', 'isActive'] as const;

function pickFields<T extends readonly string[]>(body: Record<string, unknown>, fields: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  return result;
}

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
      const { name, slug } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ success: false, error: 'El nombre es requerido' });
        return;
      }
      if (!slug || typeof slug !== 'string' || !slug.trim()) {
        res.status(400).json({ success: false, error: 'El slug es requerido' });
        return;
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        res.status(400).json({ success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones' });
        return;
      }

      const data = pickFields(req.body, ALLOWED_CREATE_FIELDS) as {
        name: string; slug: string; description?: string; image?: string; parentId?: string; isActive?: boolean;
      };
      const category = await this.service.create(data);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear categoría';
      const status = message.includes('Unique constraint') ? 409 : 400;
      res.status(status).json({ success: false, error: message.includes('Unique constraint') ? 'Ya existe una categoría con ese nombre o slug' : message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.body;
      if (slug !== undefined && (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) {
        res.status(400).json({ success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones' });
        return;
      }

      const data = pickFields(req.body, ALLOWED_UPDATE_FIELDS);
      const category = await this.service.update(req.params.id, data);
      res.json({ success: true, data: category });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar';
      const status = message.includes('Unique constraint') ? 409 : 400;
      res.status(status).json({ success: false, error: message.includes('Unique constraint') ? 'Ya existe una categoría con ese nombre o slug' : message });
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
