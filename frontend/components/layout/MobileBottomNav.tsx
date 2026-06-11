'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', icon: 'home', label: 'Inicio' },
  { href: '/products', icon: 'grid_view', label: 'Tienda' },
  { href: '/wishlist', icon: 'favorite', label: 'Favoritos' },
  { href: '/cart', icon: 'shopping_cart', label: 'Carrito' },
  { href: '/profile', icon: 'person', label: 'Perfil' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { getTotalItems } = useCart();

  useEffect(() => { setMounted(true); }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary/10 lg:hidden" aria-label="Navegación principal">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = mounted ? pathname === item.href : false;
          const isCart = item.href === '/cart';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors relative',
                isActive ? 'text-primary' : 'text-primary/40'
              )}
            >
              <div className="relative">
                <MaterialIcon
                  name={item.icon}
                  filled={isActive}
                  className="text-xl"
                />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-white text-[8px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-0.5">
                    {totalItems}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
