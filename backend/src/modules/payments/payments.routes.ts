import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
const controller = new PaymentsController();

// ─── Wompi webhook (SIN authenticate — viene de los servidores de Wompi) ──
router.post('/wompi/webhook', controller.wompiWebhook);

// ─── Rutas autenticadas ────────────────────────────────────────────────────
router.post('/', authenticate, controller.create);
router.get('/:orderId', authenticate, controller.getByOrder);

// ─── Wompi: sesión y verificación ─────────────────────────────────────────
router.post('/wompi/session', authenticate, controller.createWompiSession);
router.post('/wompi/verify/:transactionId', authenticate, controller.verifyTransaction);

export default router;
