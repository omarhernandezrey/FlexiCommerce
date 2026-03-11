import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
const controller = new ProductsController();

// ─── Rutas con path estático — deben ir ANTES de las rutas con parámetros ────
router.get('/search', controller.search);
router.get('/stats', authenticate, authorize('ADMIN'), controller.getStats);

// Operaciones masivas — path estático, van ANTES de /:id/*
router.post('/bulk/delete', authenticate, authorize('ADMIN'), controller.bulkDelete);
router.post('/purge-inactive', authenticate, authorize('ADMIN'), controller.purgeInactive);
router.post('/bulk/toggle-status', authenticate, authorize('ADMIN'), controller.bulkToggleStatus);

// ─── CRUD estándar ─────────────────────────────────────────────────────────
router.get('/', controller.getAll);
router.post('/', authenticate, authorize('ADMIN'), controller.create);

// ─── Rutas con parámetro /:id — siempre al final ──────────────────────────
router.get('/:id', controller.getById);
router.put('/:id', authenticate, authorize('ADMIN'), controller.update);
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);
router.patch('/:id/toggle-status', authenticate, authorize('ADMIN'), controller.toggleStatus);
router.post('/:id/duplicate', authenticate, authorize('ADMIN'), controller.duplicate);

export default router;
