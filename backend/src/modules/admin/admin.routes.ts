import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import prisma from '../../database/prisma.js';

const router = Router();

const DEFAULT_STORE: Record<string, any> = {
  logoUrl: '',
  storeName: 'FlexiCommerce',
  email: 'admin@flexicommerce.com',
  phone: '',
  address: '',
  city: '',
  zipCode: '',
  country: 'Colombia',
  currency: 'COP',
  timezone: 'America/Bogota',
  stripeEnabled: false,
  paypalEnabled: false,
  wompiEnabled: true,
  shipping: { domesticRate: '15000', freeThreshold: '200000' },
};

const DEFAULT_CMS: Record<string, any> = {
  sections: [
    { id: 'hero', visible: true },
    { id: 'grid', visible: true },
    { id: 'banner', visible: false },
    { id: 'newsletter', visible: true },
  ],
  font: 'Inter (Default)',
  maintenanceMode: false,
};

async function getSetting(key: string, defaults: Record<string, any>) {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return { ...defaults };
  try {
    return { ...defaults, ...JSON.parse(row.value) };
  } catch {
    return { ...defaults };
  }
}

async function setSetting(key: string, data: Record<string, any>) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(data) },
    update: { value: JSON.stringify(data) },
  });
  return data;
}

// GET /api/admin/store-info — público, sin autenticación (usado por el storefront)
router.get('/store-info', async (_req: Request, res: Response) => {
  try {
    const data = await getSetting('storeSettings', DEFAULT_STORE);
    res.json({ success: true, data: { logoUrl: data.logoUrl || '', storeName: data.storeName || 'FlexiCommerce' } });
  } catch {
    res.json({ success: true, data: { logoUrl: '', storeName: 'FlexiCommerce' } });
  }
});

// GET /api/admin/settings
router.get('/settings', authenticate, authorize('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const data = await getSetting('storeSettings', DEFAULT_STORE);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al leer configuración' });
  }
});

// PUT /api/admin/settings
router.put('/settings', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const current = await getSetting('storeSettings', DEFAULT_STORE);
    const updated = { ...current, ...req.body };
    await setSetting('storeSettings', updated);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'Error al guardar configuración' });
  }
});

// GET /api/admin/cms/settings
router.get('/cms/settings', authenticate, authorize('ADMIN'), async (_req: Request, res: Response) => {
  try {
    const data = await getSetting('cmsSettings', DEFAULT_CMS);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, error: 'Error al leer CMS' });
  }
});

// POST /api/admin/cms/settings
router.post('/cms/settings', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const current = await getSetting('cmsSettings', DEFAULT_CMS);
    const updated = { ...current, ...req.body };
    await setSetting('cmsSettings', updated);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: 'Error al guardar CMS' });
  }
});

export default router;
