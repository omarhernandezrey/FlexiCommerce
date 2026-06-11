import { Request, Response } from 'express';
import { CouponsService } from './coupons.service.js';

const CODE_REGEX = /^[A-Z0-9_-]{3,30}$/;
const VALID_TYPES = ['percentage', 'fixed'];

const service = new CouponsService();

function validateCoupon(data: Record<string, unknown>, isCreate: boolean): string | null {
  if (isCreate) {
    if (!data.code || typeof data.code !== 'string' || !data.code.trim()) return 'El código es requerido';
    if (!CODE_REGEX.test((data.code as string).toUpperCase())) return 'El código debe tener 3-30 caracteres (letras, números, guiones y guiones bajos)';
    if (!data.type || !VALID_TYPES.includes(data.type as string)) return 'El tipo debe ser "percentage" o "fixed"';
    if (data.value === undefined || data.value === null || isNaN(Number(data.value)) || Number(data.value) < 0) return 'El valor debe ser un número >= 0';
  }

  if ('type' in data && data.type && !VALID_TYPES.includes(data.type as string)) {
    return 'El tipo debe ser "percentage" o "fixed"';
  }

  if ('value' in data) {
    const val = Number(data.value);
    if (isNaN(val) || val < 0) return 'El valor debe ser un número >= 0';
  }

  // Validar que percentage no exceda 100
  const type = data.type as string | undefined;
  const value = data.value !== undefined ? Number(data.value) : undefined;
  if (type === 'percentage' && value !== undefined && value > 100) {
    return 'El porcentaje no puede ser mayor a 100';
  }

  if ('minOrderAmount' in data && data.minOrderAmount !== undefined && data.minOrderAmount !== null) {
    if (isNaN(Number(data.minOrderAmount)) || Number(data.minOrderAmount) < 0) return 'Monto mínimo inválido';
  }

  if ('maxUses' in data && data.maxUses !== undefined && data.maxUses !== null) {
    const maxUses = Number(data.maxUses);
    if (isNaN(maxUses) || maxUses < 0 || !Number.isInteger(maxUses)) return 'Usos máximos debe ser un entero >= 0';
  }

  return null;
}

export class CouponsController {
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, code, page, limit } = req.query;

      // Si se busca por code exacto (usado por checkout)
      if (code && typeof code === 'string') {
        const coupon = await service.getByCode(code);
        if (!coupon) {
          res.json({ success: true, data: [] });
          return;
        }
        res.json({ success: true, data: [coupon] });
        return;
      }

      const result = await service.getAll({
        search: search as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener cupones';
      res.status(500).json({ success: false, error: message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const coupon = await service.getById(req.params.id);
      if (!coupon) {
        res.status(404).json({ success: false, error: 'Cupón no encontrado' });
        return;
      }
      res.json({ success: true, data: coupon });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener cupón';
      res.status(500).json({ success: false, error: message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationError = validateCoupon(req.body, true);
      if (validationError) {
        res.status(400).json({ success: false, error: validationError });
        return;
      }

      const coupon = await service.create(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('code')) {
        res.status(400).json({ success: false, error: 'Ya existe un cupón con ese código' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al crear cupón';
      res.status(400).json({ success: false, error: message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationError = validateCoupon(req.body, false);
      if (validationError) {
        res.status(400).json({ success: false, error: validationError });
        return;
      }

      const coupon = await service.update(req.params.id, req.body);
      res.json({ success: true, data: coupon });
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('code')) {
        res.status(400).json({ success: false, error: 'Ya existe un cupón con ese código' });
        return;
      }
      if (error?.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Cupón no encontrado' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al actualizar cupón';
      res.status(400).json({ success: false, error: message });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      await service.remove(req.params.id);
      res.json({ success: true, message: 'Cupón eliminado' });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Cupón no encontrado' });
        return;
      }
      const message = error instanceof Error ? error.message : 'Error al eliminar cupón';
      res.status(400).json({ success: false, error: message });
    }
  };

  validate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, orderTotal } = req.body;
      if (!code || typeof code !== 'string') {
        res.status(400).json({ success: false, error: 'Código requerido' });
        return;
      }

      const coupon = await service.validateForCheckout(code, Number(orderTotal) || 0);
      const discount = service.calculateDiscount(coupon, Number(orderTotal) || 0);

      res.json({ success: true, data: { coupon, discount } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cupón inválido';
      res.status(400).json({ success: false, error: message });
    }
  };
}
