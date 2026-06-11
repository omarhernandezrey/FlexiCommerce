import { Router, Request, Response } from 'express';
import prisma from '../../database/prisma.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// POST /api/newsletter/subscribe — público
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, error: 'Email inválido' });
      return;
    }

    const normalized = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalized },
    });

    if (existing) {
      if (existing.isActive) {
        res.json({ success: true, message: 'Ya estás suscrito' });
        return;
      }
      // Reactivar suscripción cancelada
      await prisma.newsletterSubscription.update({
        where: { email: normalized },
        data: { isActive: true },
      });
      res.json({ success: true, message: 'Suscripción reactivada' });
      return;
    }

    await prisma.newsletterSubscription.create({
      data: { email: normalized },
    });

    res.status(201).json({ success: true, message: 'Suscripción exitosa' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al suscribirse';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/newsletter/unsubscribe — público
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Email requerido' });
      return;
    }

    await prisma.newsletterSubscription.updateMany({
      where: { email: email.trim().toLowerCase() },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Suscripción cancelada' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cancelar suscripción';
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/newsletter/subscribers — solo admin
router.get('/subscribers', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscription.count({ where: { isActive: true } }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al listar suscriptores';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
