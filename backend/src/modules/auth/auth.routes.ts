import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth.js';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', verifyToken, controller.logout);
router.get('/me', verifyToken, controller.getMe);
router.post('/refresh', verifyToken, controller.refreshToken);

export default router;
