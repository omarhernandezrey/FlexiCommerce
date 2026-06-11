'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCmsHomepage } from '@/hooks/useCmsHomepage';
import apiClient from '@/lib/api-client';
import { Product } from '@/lib/api.service';

// ─── Skeletons ──────────────────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl bg-primary/5 animate-pulse" />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-primary/5 p-2 sm:p-4 animate-pulse">
      <div className="rounded-lg aspect-square mb-2 sm:mb-4 bg-primary/5" />
      <div className="space-y-2">
        <div className="h-2 w-16 bg-primary/5 rounded" />
        <div className="h-3 w-full bg-primary/10 rounded" />
        <div className="h-3 w-3/4 bg-primary/5 rounded" />
        <div className="flex justify-between pt-2">
          <div className="h-5 w-20 bg-primary/10 rounded" />
          <div className="size-7 sm:size-9 bg-primary/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <MaterialIcon name="error_outline" className="text-4xl text-red-400" />
      <p className="text-sm text-primary/60">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

// ─── Página Principal ───────────────────────────────────────────────────────
export default function StorefrontHome() {
  const cms = useCmsHomepage();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  } = useCategories();
  const {
    products: apiProducts,
    loading: productsLoading,
    error: productsError,
    fetchAll,
  } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Cargar productos destacados (featured) o fallback a los más recientes
  const loadFeatured = useCallback(async () => {
    try {
      setFeaturedLoading(true);
      const res = await apiClient.get('/api/products', { params: { featured: 'true', limit: 8 } });
      const raw = (res.data as any)?.data ?? res.data ?? [];
      const products = Array.isArray(raw) ? raw : [];
      if (products.length >= 4) {
        setFeaturedProducts(products.map(normalizeProduct));
      } else {
        const allRes = await fetchAll({ limit: 8 });
        setFeaturedProducts(allRes.slice(0, 8));
      }
    } catch {
      try {
        const allRes = await fetchAll({ limit: 8 });
        setFeaturedProducts(allRes.slice(0, 8));
      } catch { /* ya se maneja en useProducts */ }
    } finally {
      setFeaturedLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    loadFeatured();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    setNewsletterState('loading');
    try {
      const res = await apiClient.post('/api/newsletter/subscribe', { email });
      const data = (res.data as any);
      setNewsletterState('success');
      setNewsletterMsg(data?.message || 'Suscripción exitosa');
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterState('error');
      setNewsletterMsg(err?.response?.data?.error || 'Error al suscribirse. Intenta de nuevo.');
    }
  };

  // Modo mantenimiento
  if (!cms.loading && cms.maintenanceMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <MaterialIcon name="engineering" className="text-6xl text-primary/40" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">Sitio en Mantenimiento</h1>
        <p className="text-primary/60 text-sm sm:text-base max-w-md">
          Estamos realizando mejoras. Vuelve pronto.
        </p>
      </div>
    );
  }

  const heroSection = cms.sections.hero;
  const categoriesSection = cms.sections.categories;
  const productsSection = cms.sections.products;
  const benefitsSection = cms.sections.benefits;
  const newsletterSection = cms.sections.newsletter;

  return (
    <div className="section-wrapper">
      {/* Hero Banner */}
      {heroSection.visible && (
        <section className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 min-h-[200px] sm:min-h-[280px] md:min-h-[360px] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
          <div className="relative z-10 px-6 sm:px-10 md:px-16 py-8 sm:py-12 md:py-16 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Bienvenido a {cms.storeName}
            </h1>
            <p className="text-white/70 mt-3 sm:mt-4 text-sm sm:text-base md:text-lg leading-relaxed">
              {heroSection.subtitle}
            </p>
            <Link
              href={heroSection.ctaLink}
              className="inline-flex items-center gap-2 mt-6 sm:mt-8 px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors text-sm sm:text-base"
            >
              {heroSection.cta}
              <MaterialIcon name="arrow_forward" className="text-lg" />
            </Link>
          </div>
        </section>
      )}

      {/* Categorías */}
      {categoriesSection.visible && (
        <section className="spacing-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">{categoriesSection.title}</h2>
              <p className="text-primary/60 text-xs sm:text-sm mt-1">{categoriesSection.subtitle}</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
            >
              Ver todos los productos <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>

          {categoriesError && !categoriesLoading && categories.length === 0 ? (
            <ErrorRetry message="No se pudieron cargar las categorías" onRetry={refreshCategories} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
              {categoriesLoading && categories.length === 0
                ? Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
                : categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="group relative h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-primary/5"
                      aria-label={`Categoría ${cat.name}${cat.productCount > 0 ? `, ${cat.productCount} productos` : ''}`}
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
                  ))
              }
            </div>
          )}
        </section>
      )}

      {/* Productos Destacados */}
      {productsSection.visible && (
        <section className="spacing-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">{productsSection.title}</h2>
              <p className="text-primary/60 text-xs sm:text-sm mt-1">{productsSection.subtitle}</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary font-semibold text-xs sm:text-sm hover:underline"
            >
              Ver todos <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>

          {productsError && !featuredLoading && featuredProducts.length === 0 ? (
            <ErrorRetry message="No se pudieron cargar los productos" onRetry={loadFeatured} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-gap-standard">
              {featuredLoading && featuredProducts.length === 0
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
              }
            </div>
          )}
        </section>
      )}

      {/* Beneficios */}
      {benefitsSection.visible && (
        <section className="bg-primary text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2"></div>
          <div className="relative z-10">
            <span className="text-white/60 font-bold tracking-widest uppercase text-xs">Tu Experiencia de Compra</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-3 sm:mt-4 leading-tight">
              {benefitsSection.title}
            </h2>
            <p className="text-white/70 mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
              {benefitsSection.subtitle}
            </p>
            <div className="mt-8 sm:mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {benefitsSection.items.map((f) => (
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
        </section>
      )}

      {/* Newsletter */}
      {newsletterSection.visible && (
        <section className="bg-primary/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mb-2">{newsletterSection.title}</h2>
          <p className="text-primary/60 mb-6 sm:mb-8 text-sm sm:text-base">
            {newsletterSection.subtitle}
          </p>
          {newsletterState === 'success' ? (
            <div className="flex items-center justify-center gap-2 max-w-md mx-auto py-3 px-6 bg-green-50 border border-green-200 rounded-lg">
              <MaterialIcon name="check_circle" className="text-green-600 text-xl" />
              <p className="text-green-700 font-bold text-sm">{newsletterMsg}</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => { setNewsletterEmail(e.target.value); if (newsletterState === 'error') setNewsletterState('idle'); }}
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
              {newsletterState === 'error' && (
                <p className="text-red-500 text-xs mt-3">{newsletterMsg}</p>
              )}
            </>
          )}
          <p className="text-xs text-primary/40 mt-4">Respetamos tu privacidad. Cancela la suscripción cuando quieras.</p>
        </section>
      )}
    </div>
  );
}

// Normalizar producto del API crudo
function normalizeProduct(p: any): Product {
  const reviews = Array.isArray(p.reviews) ? p.reviews : [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating ?? 0), 0) / reviews.length
    : (p.rating != null ? Number(p.rating) : 0);

  return {
    ...p,
    price: Number(p.price ?? 0),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    rating: Math.round(avgRating * 10) / 10,
    reviews: Array.isArray(p.reviews) ? p.reviews.length : (p.reviews ?? 0),
    image: p.image ?? (Array.isArray(p.images) ? p.images[0] : undefined) ?? '',
    images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
    category: typeof p.category === 'object' && p.category !== null ? p.category.name : (p.category ?? ''),
    stock: Number(p.stock ?? 0),
    isFeatured: p.isFeatured ?? false,
  };
}
