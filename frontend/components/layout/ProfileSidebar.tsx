'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useAuth } from '@/hooks/useAuth';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { useRouter } from 'next/navigation';
import { IMAGES } from '@/lib/constants';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/profile', icon: 'person', label: 'My Profile' },
  { href: '/orders', icon: 'shopping_bag', label: 'My Orders' },
  { href: '/addresses', icon: 'location_on', label: 'Addresses' },
  { href: '/payment-methods', icon: 'credit_card', label: 'Payment Methods' },
  { href: '/wishlist', icon: 'favorite', label: 'Wishlist' },
  { href: '/compare', icon: 'compare_arrows', label: 'Compare' },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useAuthAPI();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch {
      router.push('/auth');
    }
  };

  return (
    <aside className="flex flex-col gap-3 sticky top-24">
      {/* Avatar Card */}
      <div className="bg-white rounded-xl border border-primary/10 p-5 text-center">
        <div className="relative w-fit mx-auto mb-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10 mx-auto">
            {user?.firstName ? (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <img src={IMAGES.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 size-5 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <p className="font-extrabold text-primary text-sm">
          {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
        </p>
        <p className="text-xs text-primary/40 mt-0.5 truncate">{user?.email}</p>
        <span className="inline-block mt-2 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Premium Member
        </span>
      </div>

      {/* Navigation */}
      <nav className="bg-white rounded-xl border border-primary/10 overflow-hidden">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all',
                idx !== navItems.length - 1 && 'border-b border-primary/5',
                isActive
                  ? 'bg-primary/5 text-primary border-l-2 border-l-primary'
                  : 'text-primary/60 hover:text-primary hover:bg-primary/5'
              )}
            >
              <MaterialIcon name={item.icon} className="text-base" />
              {item.label}
              {isActive && (
                <MaterialIcon name="chevron_right" className="ml-auto text-primary/40 text-base" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-primary/10 text-sm font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 transition-all w-full"
      >
        <MaterialIcon name="logout" className="text-base" />
        Sign Out
      </button>
    </aside>
  );
}
