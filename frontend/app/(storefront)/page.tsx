'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { MOCK_PRODUCTS, IMAGES } from '@/lib/constants';

export default function StorefrontHome() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative w-full h-80 sm:h-96 md:h-[500px] overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10">
        <img
          src={IMAGES.hero}
          alt="Hero Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">FlexiCommerce</h1>
            <p className="text-lg md:text-xl">Descubre productos increíbles</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-primary">Categorías Destacadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Electrónica', icon: 'devices', href: '/products?category=electronics' },
              { name: 'Moda', icon: 'shopping_bag', href: '/products?category=fashion' },
              { name: 'Hogar', icon: 'home', href: '/products?category=homeDecor' },
              { name: 'Gadgets', icon: 'developer_mode', href: '/products?category=gadgets' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5">
                  <MaterialIcon name={cat.icon} className="text-3xl text-primary" />
                  <span className="font-semibold text-primary text-center px-2">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary">Productos Destacados</h2>
            <Link
              href="/products"
              className="flex items-center gap-2 text-primary hover:underline font-semibold"
            >
              Ver todos
              <MaterialIcon name="arrow_forward" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOCK_PRODUCTS.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Suscríbete a nuestro Newsletter
          </h3>
          <p className="mb-6 text-lg">
            Recibe ofertas exclusivas y novedades directamente en tu email
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-primary focus:outline-none"
            />
            <button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Suscribir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
