'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { IMAGES } from '@/lib/constants';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAuthAPI } from '@/hooks/useAuthAPI';

const MEGA_MENU_ITEMS = {
  Electronics: {
    featured: [
      { name: 'Smartphones', icon: 'smartphone', count: 245 },
      { name: 'Laptops', icon: 'laptop', count: 128 },
      { name: 'Audio Devices', icon: 'headphones', count: 342 },
      { name: 'Smart Watches', icon: 'watch', count: 89 },
    ],
    trending: [
      'Wireless Earbuds',
      'USB-C Chargers',
      'Phone Cases',
      'Screen Protectors',
    ],
  },
  Fashion: {
    featured: [
      { name: 'Mens Clothing', icon: 'checkroom', count: 521 },
      { name: 'Womens Clothing', icon: 'checkroom', count: 634 },
      { name: 'Accessories', icon: 'shopping_bag', count: 289 },
      { name: 'Footwear', icon: 'directions_walk', count: 412 },
    ],
    trending: [
      'Summer Dresses',
      'Casual Sneakers',
      'Designer Bags',
      'Winter Jackets',
    ],
  },
};

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const router = useRouter();
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const { logout } = useAuthAPI();
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    try {
      await logout();
      setProfileMenuOpen(false);
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-primary hover:bg-primary/5 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <MaterialIcon name="shopping_bag" className="text-2xl" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary uppercase">
              Flexi<span className="font-normal">Commerce</span>
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/40">
                <MaterialIcon name="search" className="text-xl" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border-none bg-primary/5 rounded-lg focus:ring-2 focus:ring-primary/20 placeholder-primary/40 text-sm transition-all"
                placeholder="Search products, brands, or features..."
                type="text"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/wishlist"
              className="p-2 text-primary hover:bg-primary/5 rounded-full relative"
            >
              <MaterialIcon name="favorite" />
            </Link>
            <Link
              href="/cart"
              className="p-2 text-primary hover:bg-primary/5 rounded-full relative"
            >
              <MaterialIcon name="shopping_cart" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1 pr-3 hover:bg-primary/5 rounded-full border border-primary/10"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user?.firstName ? (
                    <span className="text-sm font-bold text-primary">
                      {user.firstName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <img
                      alt="User Profile"
                      src={IMAGES.userAvatar}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="text-sm font-semibold hidden lg:inline">
                  {user?.firstName ? user.firstName : 'Account'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
                  {user && (
                    <>
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-primary">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </div>
                    </>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <MaterialIcon name="person" className="text-base" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <MaterialIcon name="history" className="text-base" />
                    Mis Órdenes
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-200"
                    >
                      <MaterialIcon name="admin_panel_settings" className="text-base" />
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-200"
                  >
                    <MaterialIcon name="logout" className="text-base" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mega Menu Nav - Desktop */}
        <nav className="hidden lg:flex items-center gap-8 py-3 text-sm font-medium border-t border-primary/5">
          {Object.entries(MEGA_MENU_ITEMS).map(([category, items]) => (
            <div
              key={category}
              className="relative group"
              onMouseEnter={() => setActiveMegaMenu(category)}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button className="text-primary hover:text-primary/70 flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-primary/5 transition-colors">
                {category}
                <MaterialIcon name="expand_more" className="text-xs group-hover:rotate-180 transition-transform" />
              </button>

              {/* Mega Menu Dropdown */}
              {activeMegaMenu === category && (
                <div className="absolute left-0 top-full w-screen max-w-full bg-white border border-slate-200 shadow-2xl z-50 animate-fade-in">
                  <div className="max-w-7xl mx-auto px-8 py-8">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Featured Categories */}
                      <div>
                        <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-wide">Featured Categories</h3>
                        <div className="space-y-2">
                          {items.featured.map((item) => (
                            <Link
                              key={item.name}
                              href="/products"
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <MaterialIcon name={item.icon} className="text-base" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-primary group-hover:text-primary/80">{item.name}</p>
                                <p className="text-xs text-slate-500">{item.count} items</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Trending Products */}
                      <div>
                        <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-wide">Trending Now</h3>
                        <div className="space-y-2">
                          {items.trending.map((trend) => (
                            <Link
                              key={trend}
                              href="/products"
                              className="block p-3 rounded-lg text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                            >
                              {trend}
                            </Link>
                          ))}
                        </div>

                        {/* Special Banner */}
                        <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                          <p className="text-xs font-bold text-primary mb-2">EXCLUSIVE OFFER</p>
                          <p className="text-sm font-bold text-primary">Get 20% off on all {category}</p>
                          <p className="text-xs text-slate-600">Use code: {category.toUpperCase()}20</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="h-4 w-px bg-primary/10 mx-2" />
          <Link href="/products" className="text-primary/60 hover:text-primary font-semibold transition-colors">
            New Arrivals
          </Link>
          <Link href="/products" className="text-red-600 font-semibold italic hover:text-red-700 transition-colors">
            Clearance Sale
          </Link>
        </nav>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-primary/5 space-y-2">
            {/* Mobile search */}
            <div className="relative mb-4 md:hidden">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/40">
                <MaterialIcon name="search" className="text-xl" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border-none bg-primary/5 rounded-lg focus:ring-2 focus:ring-primary/20 placeholder-primary/40 text-sm"
                placeholder="Search products..."
                type="text"
              />
            </div>
            {Object.keys(MEGA_MENU_ITEMS).map((category) => (
              <Link
                key={category}
                href="/products"
                className="block py-2 text-primary hover:text-primary/70 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
            <Link
              href="/products"
              className="block py-2 text-primary/60 hover:text-primary font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              New Arrivals
            </Link>
            <Link
              href="/products"
              className="block py-2 text-red-600 font-semibold italic"
              onClick={() => setMobileMenuOpen(false)}
            >
              Clearance Sale
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
