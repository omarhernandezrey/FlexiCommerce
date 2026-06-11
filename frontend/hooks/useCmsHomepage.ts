'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export interface BenefitItem {
  icon: string;
  title: string;
  desc: string;
}

export interface CmsSections {
  hero: {
    visible: boolean;
    subtitle: string;
    cta: string;
    ctaLink: string;
  };
  categories: {
    visible: boolean;
    title: string;
    subtitle: string;
  };
  products: {
    visible: boolean;
    title: string;
    subtitle: string;
  };
  benefits: {
    visible: boolean;
    title: string;
    subtitle: string;
    items: BenefitItem[];
  };
  newsletter: {
    visible: boolean;
    title: string;
    subtitle: string;
  };
}

export interface CmsHomepageData {
  sections: CmsSections;
  font: string;
  maintenanceMode: boolean;
  storeName: string;
}

const DEFAULTS: CmsHomepageData = {
  sections: {
    hero: { visible: true, subtitle: 'Descubre productos exclusivos con la mejor calidad y los mejores precios', cta: 'Explorar Tienda', ctaLink: '/products' },
    categories: { visible: true, title: 'Explorar Categorías', subtitle: 'Encuentra lo que buscas' },
    products: { visible: true, title: 'Productos Destacados', subtitle: 'Seleccionados para ti' },
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
    newsletter: { visible: true, title: 'Únete a Nuestro Boletín', subtitle: 'Recibe ofertas exclusivas, acceso anticipado a novedades y beneficios solo para miembros' },
  },
  font: 'Inter (Predeterminada)',
  maintenanceMode: false,
  storeName: 'FlexiCommerce',
};

export function useCmsHomepage() {
  const [data, setData] = useState<CmsHomepageData>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/api/admin/cms/homepage')
      .then((res) => {
        const raw = (res.data as any)?.data ?? res.data;
        if (raw?.sections) {
          setData({
            sections: {
              hero: { ...DEFAULTS.sections.hero, ...raw.sections.hero },
              categories: { ...DEFAULTS.sections.categories, ...raw.sections.categories },
              products: { ...DEFAULTS.sections.products, ...raw.sections.products },
              benefits: {
                ...DEFAULTS.sections.benefits,
                ...raw.sections.benefits,
                items: Array.isArray(raw.sections.benefits?.items) && raw.sections.benefits.items.length > 0
                  ? raw.sections.benefits.items
                  : DEFAULTS.sections.benefits.items,
              },
              newsletter: { ...DEFAULTS.sections.newsletter, ...raw.sections.newsletter },
            },
            font: raw.font || DEFAULTS.font,
            maintenanceMode: raw.maintenanceMode ?? false,
            storeName: raw.storeName || DEFAULTS.storeName,
          });
        }
      })
      .catch(() => {
        // Use defaults silently
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading };
}
