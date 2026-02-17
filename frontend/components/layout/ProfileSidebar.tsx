'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/profile', icon: 'person', label: 'Profile' },
  { href: '/orders', icon: 'package', label: 'My Orders' },
  { href: '/addresses', icon: 'location_on', label: 'Addresses' },
  { href: '/payment-methods', icon: 'credit_card', label: 'Payment Methods' },
  { href: '/wishlist', icon: 'favorite', label: 'Wishlist' },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-primary text-white hidden lg:flex flex-col fixed inset-y-0 shadow-2xl z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="size-8 bg-white/10 rounded flex items-center justify-center">
          <MaterialIcon name="shopping_bag" className="text-white" />
        </div>
        <Link href="/">
          <h1 className="text-xl font-bold tracking-tight">FlexiCommerce</h1>
        </Link>
      </div>

      <nav className="flex-1 mt-6">
        <div className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white/10 border-l-4 border-white text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <MaterialIcon name={item.icon} className="text-xl" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-6 mt-auto border-t border-white/10">
        <Link
          href="/auth"
          className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 transition-all"
        >
          <MaterialIcon name="logout" className="text-xl" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
