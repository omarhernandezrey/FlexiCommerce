import { Request, Response } from 'express';
import { OrdersService } from './orders.service.js';
import { emailService } from '../../utils/emailService.js';

export class OrdersController {
  private service = new OrdersService();

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.service.getByUser(req.user.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  getAllAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.service.getAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.service.getById(req.params.id);
      if (!order) {
        res.status(404).json({ success: false, error: 'Orden no encontrada' });
        return;
      }
      // Solo el dueño de la orden o un ADMIN puede verla
      if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, error: 'No autorizado' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.service.create(req.user.id, req.body.items, {
        shippingAddress: req.body.shippingAddress,
        shippingMethod: req.body.shippingMethod,
        shippingCost: req.body.shippingCost,
        discount: req.body.discount,
        currency: 'COP',
      });

      // Send confirmation email
      try {
        await emailService.sendOrderConfirmation({
          orderId: order.id,
          customerName: req.user.firstName || 'Cliente',
          customerEmail: req.user.email,
          total: Number(order.total),
          items: order.items.map((item: any) => ({
            name: item.product?.name ?? `Producto ${item.productId}`,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          shippingAddress: req.body.shippingAddress || 'No especificada',
          paymentMethod: req.body.paymentMethod || 'No especificado',
        });
      } catch (_emailError) {
        // Email sending is non-critical
      }

      res.status(201).json({ success: true, data: order });
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Error al crear orden';
      // Prisma foreign key error → sesión desactualizada (re-seed de BD)
      const message = raw.includes('Foreign key') || raw.includes('foreign key')
        ? 'Tu sesión está desactualizada. Por favor cierra sesión e inicia sesión de nuevo.'
        : raw;
      res.status(400).json({ success: false, error: message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.service.updateStatus(req.params.id, req.body.status);

      // Send status update emails to the CUSTOMER (not the admin)
      try {
        const customerEmail = (order as any).user?.email;
        if (customerEmail) {
          const upperStatus = req.body.status?.toUpperCase?.() ?? '';
          if (upperStatus === 'SHIPPED') {
            await emailService.sendOrderShipped(order.id, customerEmail, req.body.trackingNumber);
          } else if (upperStatus === 'DELIVERED') {
            await emailService.sendOrderDelivered(order.id, customerEmail);
          }
        }
      } catch (_emailError) {
        // Email sending is non-critical
      }

      res.json({ success: true, data: order });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar estado';
      res.status(400).json({ success: false, error: message });
    }
  };
}
