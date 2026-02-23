'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/products', icon: 'grid_view', label: 'Shop' },
  { href: '/wishlist', icon: 'favorite', label: 'Wishlist' },
  { href: '/checkout', icon: 'shopping_cart', label: 'Cart' },
  { href: '/profile', icon: 'person', label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary/10 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = mounted ? pathname === item.href : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-primary/40'
              )}
            >
              <MaterialIcon
                name={item.icon}
                filled={isActive}
                className="text-xl"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
