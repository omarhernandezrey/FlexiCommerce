import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new ProductsController();

router.get('/search', controller.search);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, authorize('ADMIN'), controller.create);
router.put('/:id', authenticate, authorize('ADMIN'), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

export default router;
