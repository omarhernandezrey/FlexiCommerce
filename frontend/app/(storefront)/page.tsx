'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import apiClient from '@/lib/api-client';

interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

export default function StorefrontHome() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const { products: apiProducts, fetchAll } = useProducts();

  useEffect(() => {
    fetchAll().catch(() => {});
    // Cargar categorías reales
    apiClient.get('/api/categories')
      .then((res) => {
        const raw = (res.data as any)?.data ?? res.data;
        if (!Array.isArray(raw)) return;
        const cats: HomeCategory[] = raw.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          productCount: c._count?.products ?? 0,
        }));
        setCategories(cats);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredProducts = apiProducts.slice(0, 8);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterState('loading');
    // Simulate API call — replace with real endpoint when available
    await new Promise((r) => setTimeout(r, 700));
    setNewsletterState('success');
    setNewsletterEmail('');
  };

  return (
    <div className="section-wrapper">
      {/* Browse Categories */}
      {categories.length > 0 && (
        <section className="spacing-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">Explorar Categorías</h2>
              <p className="text-primary/60 text-xs sm:text-sm mt-1">Encuentra lo que buscas</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
            >
              Ver todos <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-primary/5"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 transition-colors">
                    <MaterialIcon name="category" className="text-4xl text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
                  <p className="font-extrabold text-xs sm:text-sm md:text-lg leading-tight">{cat.name}</p>
                  {cat.productCount > 0 && (
                    <p className="text-[10px] sm:text-xs text-white/80">{cat.productCount} productos</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos Destacados */}
      {featuredProducts.length > 0 && (
        <section className="spacing-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">Productos Destacados</h2>
              <p className="text-primary/60 text-xs sm:text-sm mt-1">Descubre nuestro catálogo</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
            >
              Ver todos <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>
      )}

      {/* Engineered for Scale - Platform Features */}
      <section className="bg-primary text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div>
            <span className="text-white/60 font-bold tracking-widest uppercase text-xs">Listo para Empresas</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mt-3 sm:mt-4 leading-tight">
              Diseñado para Escalar,<br />Construido para el Éxito
            </h2>
            <p className="text-white/70 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed">
              FlexiCommerce no es solo una tienda; es una plataforma multi-tenant diseñada para marcas globales
              que requieren alto rendimiento, seguridad y escalabilidad infinita.
            </p>
            <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: 'hub', title: 'Multi-Tenant', desc: 'Gestiona cientos de tiendas desde un hub unificado.' },
                { icon: 'speed', title: 'Ultra Rápido', desc: '99.9% de disponibilidad con cargas sub-segundo.' },
                { icon: 'security', title: 'Encriptado', desc: 'Transacciones seguras PCI-DSS Nivel 1.' },
                { icon: 'cloud_sync', title: 'Sincronización en Vivo', desc: 'Inventario y logística en tiempo real.' },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 sm:gap-4">
                  <div className="size-11 sm:size-12 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MaterialIcon name={f.icon} className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 text-sm sm:text-base">{f.title}</h4>
                    <p className="text-xs sm:text-sm text-white/50">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
              alt="Plataforma FlexiCommerce"
              className="rounded-lg sm:rounded-xl shadow-2xl rotate-3 w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mb-2">Únete al Club Élite de Comercio</h2>
        <p className="text-primary/60 mb-6 sm:mb-8 text-sm sm:text-base">
          Obtén 20% de descuento en tu primer pedido y accede a ofertas exclusivas, acceso anticipado a novedades y beneficios exclusivos para miembros
        </p>
        {newsletterState === 'success' ? (
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto py-3 px-6 bg-green-50 border border-green-200 rounded-lg">
            <MaterialIcon name="check_circle" className="text-green-600 text-xl" />
            <p className="text-green-700 font-bold text-sm">¡Ya eres miembro! Revisa tu bandeja de entrada para tu código de 20% de descuento.</p>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              required
              className="flex-1 px-4 py-2.5 sm:py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
            />
            <button
              type="submit"
              disabled={newsletterState === 'loading'}
              className="px-6 py-2.5 sm:py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm disabled:opacity-70 flex items-center gap-2 justify-center"
            >
              {newsletterState === 'loading' && <MaterialIcon name="sync" className="text-base animate-spin" />}
              {newsletterState === 'loading' ? 'Suscribiendo...' : 'Suscribirse'}
            </button>
          </form>
        )}
        <p className="text-xs text-primary/40 mt-4">Respetamos tu privacidad. Cancela la suscripción cuando quieras.</p>
      </section>
    </div>
  );
}
