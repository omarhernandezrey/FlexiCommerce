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
  sections: {
    hero: {
      visible: true,
      subtitle: 'Descubre productos exclusivos con la mejor calidad y los mejores precios',
      cta: 'Explorar Tienda',
      ctaLink: '/products',
    },
    categories: {
      visible: true,
      title: 'Explorar Categorías',
      subtitle: 'Encuentra lo que buscas',
    },
    products: {
      visible: true,
      title: 'Productos Destacados',
      subtitle: 'Seleccionados para ti',
    },
    benefits: {
      visible: true,
      title: '¿Por qué comprar aquí?',
      subtitle: 'Nos comprometemos a ofrecerte la mejor experiencia de compra online con beneficios reales.',
      items: [
        { icon: 'local_shipping', title: 'Envío Rápido', desc: 'Envíos a todo el país. Gratis en compras superiores.' },
        { icon: 'autorenew', title: 'Devoluciones Fáciles', desc: 'Hasta 30 días para devolver o cambiar tu compra.' },
        { icon: 'verified_user', title: 'Pago 100% Seguro', desc: 'Transacciones encriptadas y múltiples métodos de pago.' },
        { icon: 'support_agent', title: 'Soporte Dedicado', desc: 'Atención al cliente disponible para ayudarte siempre.' },
      ],
    },
    newsletter: {
      visible: true,
      title: 'Únete a Nuestro Boletín',
      subtitle: 'Recibe ofertas exclusivas, acceso anticipado a novedades y beneficios solo para miembros',
    },
  },
  font: 'Inter (Predeterminada)',
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

// GET /api/admin/cms/homepage — PÚBLICO, sin auth (consumido por el storefront)
router.get('/cms/homepage', async (_req: Request, res: Response) => {
  try {
    const [cmsData, storeData] = await Promise.all([
      getSetting('cmsSettings', DEFAULT_CMS),
      getSetting('storeSettings', DEFAULT_STORE),
    ]);
    res.json({
      success: true,
      data: {
        sections: cmsData.sections,
        font: cmsData.font,
        maintenanceMode: cmsData.maintenanceMode,
        storeName: storeData.storeName || 'FlexiCommerce',
      },
    });
  } catch {
    res.json({ success: true, data: { ...DEFAULT_CMS, storeName: 'FlexiCommerce' } });
  }
});

export default router;
