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

  createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency = 'usd' } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: 'Cantidad inválida' });
        return;
      }

      // En producción integrar con Stripe:
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(amount * 100),
      //   currency,
      //   automatic_payment_methods: { enabled: true },
      // });

      res.json({
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
        amount,
        currency,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error al crear payment intent',
      });
    }
  };

  confirmPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({ error: 'PaymentIntent ID requerido' });
        return;
      }

      // En producción:
      // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      res.json({
        success: true,
        paymentIntentId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al confirmar pago',
      });
    }
  };

  processPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, paymentMethod } = req.body;

      if (!amount || !paymentMethod) {
        res.status(400).json({ error: 'Datos de pago inválidos' });
        return;
      }

      // En producción:
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(amount * 100),
      //   currency,
      //   payment_method: paymentMethod,
      //   confirm: true,
      // });

      res.json({
        success: true,
        paymentIntentId: `pi_${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar pago',
      });
    }
  };
}
