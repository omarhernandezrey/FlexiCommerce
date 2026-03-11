import { Request, Response } from 'express';
import { ProductsService } from './products.service.js';

// Campos permitidos para crear/actualizar productos
const ALLOWED_FIELDS = ['name', 'slug', 'description', 'price', 'stock', 'images', 'categoryId', 'isActive'] as const;

function pickAllowed(body: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) result[key] = body[key];
  }
  return result;
}

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_BULK_IDS = 500;

function validateProduct(data: Record<string, unknown>, isCreate: boolean): string | null {
  if (isCreate) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) return 'El nombre es requerido';
    if (!data.slug || typeof data.slug !== 'string' || !data.slug.trim()) return 'El slug es requerido';
    if (typeof data.slug === 'string' && !SLUG_REGEX.test(data.slug)) return 'Slug inválido: solo minúsculas, números y guiones (sin guiones consecutivos ni al inicio/final)';
    if (!data.description || typeof data.description !== 'string' || !data.description.trim()) return 'La descripción es requerida';
    if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) return 'Precio inválido';
    if (data.stock === undefined || data.stock === null || isNaN(Number(data.stock)) || Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) return 'Stock debe ser un número entero ≥ 0';
    if (!data.categoryId || typeof data.categoryId !== 'string') return 'Categoría requerida';
    if ('images' in data && (!Array.isArray(data.images) || !data.images.every((img: unknown) => typeof img === 'string'))) return 'Imágenes debe ser un arreglo de URLs';
  } else {
    if ('name' in data && (typeof data.name !== 'string' || !data.name.trim())) return 'Nombre inválido';
    if ('slug' in data && (typeof data.slug !== 'string' || !SLUG_REGEX.test(data.slug))) return 'Slug inválido: solo minúsculas, números y guiones (sin guiones consecutivos ni al inicio/final)';
    if ('price' in data && (isNaN(Number(data.price)) || Number(data.price) < 0)) return 'Precio inválido';
    if ('stock' in data && (isNaN(Number(data.stock)) || Number(data.stock) < 0 || !Number.isInteger(Number(data.stock)))) return 'Stock debe ser un número entero ≥ 0';
    if ('images' in data && (!Array.isArray(data.images) || !data.images.every((img: unknown) => typeof img === 'string'))) return 'Imágenes debe ser un arreglo de URLs';
  }
  return null;
}

export class ProductsController {
  private service = new ProductsService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        category,
        admin,
        status,
        stock: stockFilter,
        sortBy,
        sortOrder,
        search,
      } = req.query;

      // Solo usuarios ADMIN pueden activar adminMode (ver inactivos)
      const isAdmin = !!(req as any).user?.role && (req as any).user.role === 'ADMIN';
      const result = await this.service.getAll(
        Number(page),
        Number(limit),
        category as string | undefined,
        isAdmin && admin === 'true',
        status as 'active' | 'inactive' | 'all' | undefined,
        stockFilter as 'in' | 'low' | 'out' | undefined,
        sortBy as string | undefined,
        sortOrder as 'asc' | 'desc' | undefined,
        search as string | undefined,
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
      const data = pickAllowed(req.body);
      const validationError = validateProduct(data, true);
      if (validationError) {
        res.status(400).json({ success: false, error: validationError });
        return;
      }
      const product = await this.service.create(data as any);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
        res.status(400).json({ success: false, error: 'Ya existe un producto con ese slug. Usa uno diferente.' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al crear producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = pickAllowed(req.body);
      const validationError = validateProduct(data, false);
      if (validationError) {
        res.status(400).json({ success: false, error: validationError });
        return;
      }
      const product = await this.service.update(req.params.id, data);
      res.json({ success: true, data: product });
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
        res.status(400).json({ success: false, error: 'Ya existe un producto con ese slug. Usa uno diferente.' });
        return;
      }
      if (error?.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al actualizar producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.remove(req.params.id);
      res.json({ success: true, message: 'Producto eliminado' });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  toggleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.service.toggleStatus(req.params.id);
      res.json({ success: true, data: product });
    } catch (error: any) {
      if (error?.code === 'P2025' || error?.message === 'Producto no encontrado') {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al cambiar estado';
      res.status(400).json({ success: false, error: message });
    }
  };

  duplicate = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.service.duplicate(req.params.id);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      if (error?.code === 'P2025' || error?.message === 'Producto no encontrado') {
        res.status(404).json({ success: false, error: 'Producto no encontrado' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al duplicar producto';
      res.status(400).json({ success: false, error: message });
    }
  };

  bulkDelete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, error: 'IDs requeridos' });
        return;
      }
      if (ids.length > MAX_BULK_IDS) {
        res.status(400).json({ success: false, error: `Máximo ${MAX_BULK_IDS} productos por operación` });
        return;
      }
      const result = await this.service.bulkDelete(ids);
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar productos';
      res.status(400).json({ success: false, error: message });
    }
  };

  bulkToggleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ids, isActive } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, error: 'IDs requeridos' });
        return;
      }
      if (ids.length > MAX_BULK_IDS) {
        res.status(400).json({ success: false, error: `Máximo ${MAX_BULK_IDS} productos por operación` });
        return;
      }
      const result = await this.service.bulkToggleStatus(ids, Boolean(isActive));
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar estado masivo';
      res.status(400).json({ success: false, error: message });
    }
  };

  purgeInactive = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.purgeInactive();
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al purgar inactivos';
      res.status(500).json({ success: false, error: message });
    }
  };

  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener estadísticas';
      res.status(500).json({ success: false, error: message });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, page = '1', limit = '10' } = req.query;

      if (!q || typeof q !== 'string' || !q.trim()) {
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
