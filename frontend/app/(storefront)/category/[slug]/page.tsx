'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { MOCK_PRODUCTS, CATEGORIES, type MockProduct } from '@/lib/constants';

const CATEGORY_META: Record<string, { title: string; description: string; gradient: string; icon: string }> = {
  electronics: {
    title: 'Electrónica',
    description: 'Descubre lo último en electrónica de consumo — auriculares, laptops, smartphones y más.',
    gradient: 'from-blue-600 to-indigo-800',
    icon: 'devices',
  },
  fashion: {
    title: 'Moda',
    description: 'Explora ropa, accesorios y calzado premium de los mejores diseñadores del mundo.',
    gradient: 'from-pink-500 to-rose-700',
    icon: 'checkroom',
  },
  'home-decor': {
    title: 'Decoración del Hogar',
    description: 'Transforma tu espacio con muebles, iluminación y accesorios de interior curados.',
    gradient: 'from-amber-500 to-orange-700',
    icon: 'chair',
  },
  'smart-gadgets': {
    title: 'Gadgets Inteligentes',
    description: 'Los gadgets más inteligentes para hacer tu vida más fácil, conectada y divertida.',
    gradient: 'from-green-500 to-teal-700',
    icon: 'smart_toy',
  },
  sports: {
    title: 'Deportes y Aire Libre',
    description: 'Equípate para tu próxima aventura con equipo deportivo premium y ropa activa.',
    gradient: 'from-orange-500 to-red-700',
    icon: 'sports',
  },
  tech: {
    title: 'Tecnología',
    description: 'Productos tecnológicos de vanguardia para trabajo, entretenimiento y todo lo demás.',
    gradient: 'from-violet-600 to-purple-800',
    icon: 'memory',
  },
  lifestyle: {
    title: 'Estilo de Vida',
    description: 'Productos premium de estilo de vida diseñados para quienes aprecian la calidad y el estilo.',
    gradient: 'from-cyan-500 to-blue-700',
    icon: 'spa',
  },
};

const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price_asc', label: 'Precio: Menor a mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a menor' },
  { value: 'rating', label: 'Mejor calificación' },
  { value: 'newest', label: 'Más recientes' },
];

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const meta = CATEGORY_META[slug] || {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Explora todos los productos de esta categoría.`,
    gradient: 'from-primary to-primary/70',
    icon: 'category',
  };

  const { products, loading, fetchAll } = useProducts();
  const [sort, setSort] = useState('featured');
  const [priceMax, setPriceMax] = useState(5000);

  // Fallback to mock products filtered by category name
  const categoryName = meta.title;
  const mockFiltered = MOCK_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  useEffect(() => {
    fetchAll({ category: categoryName, limit: 24 }).catch(() => {});
  }, [categoryName, fetchAll]);

  // Use real products if available (cast to MockProduct shape), else mock
  const displayProducts: MockProduct[] =
    products.length > 0
      ? (products as unknown as MockProduct[])
      : mockFiltered;

  // Client-side sort
  const sorted = [...displayProducts].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  const filtered = sorted.filter((p) => p.price <= priceMax);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-primary/40">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <Link href="/products" className="hover:text-primary transition-colors">Productos</Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="text-primary font-medium">{meta.title}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className={`relative bg-gradient-to-r ${meta.gradient} rounded-2xl overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-8 right-32 w-56 h-56 rounded-full bg-white" />
          <div className="absolute top-12 right-48 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative z-10 px-8 py-12 md:px-16 md:py-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MaterialIcon name={meta.icon} className="text-white text-2xl" />
            </div>
            <span className="text-white/70 text-sm font-bold uppercase tracking-widest">Categoría</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
            {meta.title}
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
            {meta.description}
          </p>
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-full">
              {filtered.length} Productos
            </span>
            <Link
              href={`/products?category=${encodeURIComponent(categoryName)}`}
              className="bg-white text-primary font-bold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors flex items-center gap-1.5"
            >
              Ver todos <MaterialIcon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary/50 font-medium">
            {loading ? 'Cargando...' : `${filtered.length} productos`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Price Max */}
          <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-3 py-2">
            <MaterialIcon name="attach_money" className="text-primary/60 text-sm" />
            <span className="text-xs font-bold text-primary/60">Máx:</span>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none"
            >
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={2000}>$2,000</option>
              <option value={5000}>$5,000+</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-primary/10 rounded-xl px-3 py-2 text-xs font-bold text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-primary/5 rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-primary/10 p-16 text-center">
          <MaterialIcon name="search_off" className="text-5xl text-primary/20 mb-4" />
          <h3 className="font-extrabold text-primary text-xl mb-2">No se encontraron productos</h3>
          <p className="text-sm text-primary/50 mb-6">Intenta ajustar tus filtros o explorar otras categorías</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="arrow_back" className="text-base" />
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* See More */}
          <div className="text-center">
            <Link
              href={`/products?category=${encodeURIComponent(categoryName)}`}
              className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
            >
              Ver todos los productos de {meta.title}
              <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
          </div>
        </>
      )}

      {/* Related Categories */}
      <div className="spacing-section">
        <h2 className="text-xl font-extrabold text-primary mb-4">Otras Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.filter((c) => c.name !== meta.title).slice(0, 4).map((cat) => {
            const catSlug = cat.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={cat.name}
                href={`/category/${catSlug}`}
                className="group relative overflow-hidden rounded-xl aspect-video bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-bold text-sm">{cat.name}</p>
                  <p className="text-white/70 text-xs">{cat.items} items</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
