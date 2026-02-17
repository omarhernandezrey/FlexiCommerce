import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new UsersController();

router.get('/me', authenticate, controller.getProfile);
router.put('/me', authenticate, controller.updateProfile);
router.get('/', authenticate, authorize('ADMIN'), controller.getAll);

export default router;
