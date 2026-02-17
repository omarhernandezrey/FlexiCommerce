import { Router } from 'express';
import { CmsController } from './cms.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new CmsController();

router.get('/', controller.getAll);
router.get('/:slug', controller.getBySlug);
router.post('/', authenticate, authorize('ADMIN'), controller.create);
router.put('/:id', authenticate, authorize('ADMIN'), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

export default router;
