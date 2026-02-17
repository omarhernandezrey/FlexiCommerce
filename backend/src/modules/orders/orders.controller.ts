import { Request, Response } from 'express';
import { OrdersService } from './orders.service.js';

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

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.service.getById(req.params.id);
      if (!order) {
        res.status(404).json({ success: false, error: 'Orden no encontrada' });
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
      const order = await this.service.create(req.user.id, req.body.items);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear orden';
      res.status(400).json({ success: false, error: message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const order = await this.service.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: order });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar estado';
      res.status(400).json({ success: false, error: message });
    }
  };
}
