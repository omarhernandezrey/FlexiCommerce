'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/cn';

const mainNav = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/products', icon: 'inventory_2', label: 'Products' },
  { href: '/admin/orders', icon: 'shopping_cart', label: 'Orders' },
  { href: '/admin/customers', icon: 'group', label: 'Customers' },
];

const cmsNav = [
  { href: '/admin/cms', icon: 'view_quilt', label: 'Page Builder' },
  { href: '/admin/menus', icon: 'menu', label: 'Menus' },
];

const settingsNav = [
  { href: '/admin/branding', icon: 'palette', label: 'Branding' },
  { href: '/admin/payments', icon: 'payments', label: 'Payments' },
  { href: '/admin/settings', icon: 'settings', label: 'Store Settings' },
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
          <div className="size-8 bg-white rounded-lg flex items-center justify-center text-primary">
            <MaterialIcon name="package_2" className="font-bold" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">FlexiCommerce</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-4">Main</p>
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} onClick={onClose} />
          ))}

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-6">CMS Editor</p>
          {cmsNav.map((item) => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} onClick={onClose} />
          ))}

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-6">Settings</p>
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
            <span className="text-sm font-medium">View Live Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
