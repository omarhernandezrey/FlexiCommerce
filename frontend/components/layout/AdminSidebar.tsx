'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import apiClient from '@/lib/api-client';
import { cn } from '@/lib/cn';

const mainNav = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/products', icon: 'inventory_2', label: 'Productos' },
  { href: '/admin/categories', icon: 'category', label: 'Categorías' },
  { href: '/admin/orders', icon: 'shopping_cart', label: 'Órdenes' },
  { href: '/admin/coupons', icon: 'local_offer', label: 'Cupones' },
  { href: '/admin/analytics', icon: 'bar_chart', label: 'Analytics' },
];

const cmsNav = [
  { href: '/admin/cms', icon: 'view_quilt', label: 'Constructor de Páginas' },
];

const settingsNav = [
  { href: '/admin/settings', icon: 'settings', label: 'Configuración' },
];

function NavItem({
  href,
  icon,
  label,
  isActive,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-white/10 border-l-[3px] border-white'
          : 'hover:bg-white/10'
      )}
    >
      <MaterialIcon name={icon} className="text-[20px]" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export function AdminSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [storeLogo, setStoreLogo] = useState('');
  const [storeName, setStoreName] = useState('FlexiCommerce');

  useEffect(() => {
    apiClient.get('/api/admin/store-info')
      .then((res) => {
        const data = (res.data as any)?.data ?? res.data;
        if (data?.logoUrl) setStoreLogo(data.logoUrl);
        if (data?.storeName) setStoreName(data.storeName);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white flex flex-col shrink-0 transition-transform duration-300',
          'lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6 flex items-center gap-3">
          {storeLogo ? (
            <div className="bg-white rounded-lg px-2 py-1 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={storeLogo} alt={storeName} className="h-6 w-auto max-w-[120px] object-contain" />
            </div>
          ) : (
            <>
              <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary">
                <MaterialIcon name="package_2" className="font-bold" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">{storeName}</h1>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-4">Principal</p>
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} onClick={onClose} />
          ))}

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-6">Editor CMS</p>
          {cmsNav.map((item) => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} onClick={onClose} />
          ))}

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-6">Ajustes</p>
          {settingsNav.map((item) => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} onClick={onClose} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <MaterialIcon name="open_in_new" className="text-[20px]" />
            <span className="text-sm font-medium">Ver Tienda en Vivo</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
