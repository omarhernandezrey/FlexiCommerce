import { Router } from 'express';
import { CouponsController } from './coupons.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new CouponsController();

// Rutas públicas (usadas por el checkout para validar cupones)
router.get('/', controller.getAll);
router.post('/validate', authenticate, controller.validate);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('ADMIN'), controller.create);
router.get('/:id', authenticate, authorize('ADMIN'), controller.getById);
router.put('/:id', authenticate, authorize('ADMIN'), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

export default router;
