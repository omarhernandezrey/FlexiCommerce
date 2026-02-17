import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
const controller = new PaymentsController();

router.post('/', authenticate, controller.create);
router.get('/:orderId', authenticate, controller.getByOrder);

export default router;
