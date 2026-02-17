import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
const controller = new PaymentsController();

router.post('/', authenticate, controller.create);
router.get('/:orderId', authenticate, controller.getByOrder);

// Stripe Payment Intent endpoints
router.post('/intent/create', authenticate, controller.createPaymentIntent);
router.post('/intent/confirm', authenticate, controller.confirmPaymentIntent);
router.post('/process', authenticate, controller.processPayment);

export default router;
