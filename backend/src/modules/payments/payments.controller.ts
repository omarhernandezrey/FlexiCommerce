import { Request, Response } from 'express';
import { PaymentsService } from './payments.service.js';

export class PaymentsController {
  private service = new PaymentsService();

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.service.create(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar pago';
      res.status(400).json({ success: false, error: message });
    }
  };

  getByOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.service.getByOrder(req.params.orderId);
      if (!payment) {
        res.status(404).json({ success: false, error: 'Pago no encontrado' });
        return;
      }
      res.json({ success: true, data: payment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error';
      res.status(500).json({ success: false, error: message });
    }
  };
}
