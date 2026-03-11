import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new UsersController();

// Profile
router.get('/me', authenticate, controller.getProfile);
router.put('/me', authenticate, controller.updateProfile);
router.put('/me/password', authenticate, controller.changePassword);
router.post('/me/avatar', authenticate, controller.updateAvatar);
router.get('/me/stats', authenticate, controller.getStats);

// Addresses
router.get('/me/addresses', authenticate, controller.getAddresses);
router.post('/me/addresses', authenticate, controller.createAddress);
router.put('/me/addresses/:id', authenticate, controller.updateAddress);
router.delete('/me/addresses/:id', authenticate, controller.deleteAddress);
router.put('/me/addresses/:id/default', authenticate, controller.setDefaultAddress);

// Admin
router.get('/', authenticate, authorize('ADMIN'), controller.getAll);

export default router;
