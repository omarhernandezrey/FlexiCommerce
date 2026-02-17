import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new OrdersController();

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, controller.create);
router.patch('/:id/status', authenticate, authorize('ADMIN'), controller.updateStatus);

export default router;
