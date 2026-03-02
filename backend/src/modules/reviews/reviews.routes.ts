import { Router } from 'express';
import { ReviewsController } from './reviews.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
const controller = new ReviewsController();

router.get('/product/:productId', controller.getByProduct);
router.get('/stats/:productId', controller.getStats);
router.get('/check/:productId', authenticate, controller.checkUserReview);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
