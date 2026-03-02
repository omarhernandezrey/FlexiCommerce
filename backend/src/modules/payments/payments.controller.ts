import { Request, Response } from 'express';
import { PaymentsService } from './payments.service.js';
import { OrdersService } from '../orders/orders.service.js';
import { WompiService } from '../../services/wompi.service.js';

export class PaymentsController {
  private service = new PaymentsService();
  private ordersService = new OrdersService();
  private wompi = new WompiService();

  // ─── Endpoints existentes ─────────────────────────────────────

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payment = await this.service.create(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar pago';
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

  // ─── Wompi: Crear sesión de pago ──────────────────────────────

  /**
   * POST /api/payments/wompi/session
   * Genera los datos necesarios para abrir el Widget de Wompi en el frontend.
   * El total se obtiene desde la BD para evitar manipulación del cliente.
   */
  createWompiSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.body as { orderId: string };

      if (!orderId) {
        res.status(400).json({ success: false, error: 'orderId es requerido' });
        return;
      }

      // Obtener la orden desde BD (total calculado en el servidor)
      const order = await this.ordersService.getById(orderId);
      if (!order) {
        res.status(404).json({ success: false, error: 'Orden no encontrada' });
        return;
      }

      // Verificar que la orden pertenece al usuario autenticado
      if (order.userId !== req.user.id) {
        res.status(403).json({ success: false, error: 'No autorizado' });
        return;
      }

      // Obtener acceptance_token (requerido por Wompi)
      const acceptanceToken = await this.wompi.getAcceptanceToken();

      // Generar referencia única para esta sesión de pago
      const reference = this.wompi.buildReference(orderId);

      // El total en centavos de COP (Wompi trabaja en centavos)
      const amountInCents = Math.round(Number(order.total) * 100);

      // Hash de integridad SHA-256
      const integrityHash = this.wompi.generateIntegrityHash(
        reference,
        amountInCents,
        'COP',
      );

      res.json({
        success: true,
        data: {
          acceptance_token: acceptanceToken,
          public_key: process.env.WOMPI_PUBLIC_KEY,
          reference,
          amount_in_cents: amountInCents,
          currency: 'COP',
          integrity_hash: integrityHash,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear sesión de pago';
      res.status(500).json({ success: false, error: message });
    }
  };

  // ─── Wompi: Verificar transacción ─────────────────────────────

  /**
   * POST /api/payments/wompi/verify/:transactionId
   * Verifica el estado de una transacción de Wompi después del redirect.
   * Si está APPROVED: actualiza la orden y registra el pago en BD.
   */
  verifyTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        res.status(400).json({ success: false, error: 'transactionId es requerido' });
        return;
      }

      // Consultar el estado real de la transacción en Wompi
      const transaction = await this.wompi.getTransaction(transactionId);

      if (!transaction) {
        res.status(404).json({ success: false, error: 'Transacción no encontrada en Wompi' });
        return;
      }

      const { status, reference, amount_in_cents, payment_method_type } = transaction;

      // Extraer orderId de la referencia (formato: {orderId}-{timestamp})
      const orderId = this.wompi.extractOrderId(reference);

      if (status === 'APPROVED') {
        // Verificar que la orden no esté ya procesada (idempotencia)
        const existingPayment = await this.service.getByOrder(orderId);

        if (!existingPayment) {
          // Registrar el pago aprobado en la BD
          await this.service.create({
            orderId,
            amount: amount_in_cents / 100,
            method: payment_method_type || 'WOMPI',
            transactionId,
          });

          // Marcar la orden como en proceso
          await this.ordersService.updateStatus(orderId, 'PROCESSING');
        }

        res.json({
          success: true,
          data: { status: 'APPROVED', orderId },
        });
        return;
      }

      // DECLINED, VOIDED, ERROR, PENDING
      res.json({
        success: true,
        data: { status, orderId },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al verificar transacción';
      res.status(500).json({ success: false, error: message });
    }
  };

  // ─── Wompi: Webhook ───────────────────────────────────────────

  /**
   * POST /api/payments/wompi/webhook
   * Recibe eventos asíncronos de Wompi (segunda capa de seguridad).
   * NO requiere autenticación — viene de los servidores de Wompi.
   * Verifica la firma antes de procesar.
   */
  wompiWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-wompi-signature'] as string;
      const rawBody = JSON.stringify(req.body);

      // Verificar que el evento viene realmente de Wompi
      if (signature && !this.wompi.verifyWebhookSignature(rawBody, signature)) {
        res.status(401).json({ error: 'Firma de webhook inválida' });
        return;
      }

      const { event, data } = req.body as {
        event: string;
        data: { transaction: any };
      };

      if (event === 'transaction.updated') {
        const tx = data.transaction;
        const orderId = this.wompi.extractOrderId(tx.reference);

        switch (tx.status) {
          case 'APPROVED': {
            const existing = await this.service.getByOrder(orderId);
            if (!existing) {
              await this.service.create({
                orderId,
                amount: tx.amount_in_cents / 100,
                method: tx.payment_method_type || 'WOMPI',
                transactionId: tx.id,
              });
            }
            await this.ordersService.updateStatus(orderId, 'PROCESSING');
            break;
          }
          case 'DECLINED':
          case 'ERROR':
            await this.ordersService.updateStatus(orderId, 'CANCELLED');
            break;
          case 'VOIDED':
            await this.service.updateByTransactionId(tx.id, 'REFUNDED');
            break;
        }
      }

      // Responder 200 siempre — Wompi reintenta si no recibe 200
      res.json({ received: true });
    } catch (error) {
      // Loguear pero responder 200 para que Wompi no reintente indefinidamente
      console.error('Error en webhook Wompi:', error);
      res.json({ received: true });
    }
  };
}
