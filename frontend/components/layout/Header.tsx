'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { IMAGES } from '@/lib/constants';
import apiClient from '@/lib/api-client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAuthAPI } from '@/hooks/useAuthAPI';

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  children: { id: string; name: string; slug: string; productCount: number }[];
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const router = useRouter();
  const { getTotalItems } = useCart();
  const { user, token } = useAuth();
  const { logout, getCurrentUser } = useAuthAPI();
  const totalItems = getTotalItems();

  // Esperar hidratación del cliente antes de mostrar datos de localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar logo y nombre de tienda desde la configuración del admin
  useEffect(() => {
    apiClient.get('/api/admin/store-info')
      .then((res) => {
        const data = (res.data as any)?.data ?? res.data;
        if (data?.logoUrl) setStoreLogo(data.logoUrl);
        if (data?.storeName) setStoreName(data.storeName);
      })
      .catch(() => {/* usa defaults */});
  }, []);

  // Cargar categorías reales desde el backend
  useEffect(() => {
    apiClient.get('/api/categories')
      .then((res) => {
        const raw = (res.data as any)?.data ?? res.data;
        if (!Array.isArray(raw)) return;
        const cats: NavCategory[] = raw.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          productCount: c._count?.products ?? 0,
          children: (c.children || []).map((ch: any) => ({
            id: ch.id,
            name: ch.name,
            slug: ch.slug,
            productCount: ch._count?.products ?? 0,
          })),
        }));
        setNavCategories(cats);
      })
      .catch(() => {});
  }, []);

  // Si hay token en el store pero no hay user, intentar recuperar el usuario
  useEffect(() => {
    if (!token || user) return;
    getCurrentUser().catch(() => {
      // Token inválido — limpiar sesión completamente
      logout();
      document.cookie = 'auth-token=; path=/; max-age=0; samesite=lax';
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const [searchQuery, setSearchQuery] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeName, setStoreName] = useState('FlexiCommerce');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Skip to main content — accesibilidad teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Ir al contenido principal
      </a>

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 lg:gap-8">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-primary hover:bg-primary/5 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          >
            <MaterialIcon name={mobileMenuOpen ? 'close' : 'menu'} aria-hidden="true" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            {storeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogo} alt={storeName} className="h-8 sm:h-10 w-auto max-w-[80px] sm:max-w-[120px] object-contain shrink-0" />
            ) : (
              <div className="size-8 sm:size-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                <MaterialIcon name="shopping_bag" className="text-lg sm:text-2xl" />
              </div>
            )}
            <span className="text-sm sm:text-xl font-extrabold tracking-tight text-primary uppercase truncate max-w-[90px] sm:max-w-none">
              {storeName}
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl hidden md:block" role="search">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/40">
                <MaterialIcon name="search" className="text-xl" aria-hidden="true" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="block w-full pl-10 pr-3 py-2 border-none bg-primary/5 rounded-lg focus:ring-2 focus:ring-primary/20 placeholder-primary/40 text-sm transition-all"
                placeholder="Buscar productos, marcas o características..."
                type="search"
                aria-label="Buscar productos"
                autoComplete="off"
              />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/wishlist"
              className="p-2 text-primary hover:bg-primary/5 rounded-full relative"
              aria-label="Ver lista de deseos"
            >
              <MaterialIcon name="favorite" aria-hidden="true" />
            </Link>
            <Link
              href="/cart"
              className="p-2 text-primary hover:bg-primary/5 rounded-full relative"
              aria-label={mounted && totalItems > 0 ? `Ver carrito (${totalItems} artículos)` : 'Ver carrito'}
            >
              <MaterialIcon name="shopping_cart" aria-hidden="true" />
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" aria-hidden="true">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1 pr-3 hover:bg-primary/5 rounded-full border border-primary/10"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                aria-label="Abrir menú de cuenta"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {mounted && user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : mounted && user?.firstName ? (
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
                  {mounted && user?.firstName ? user.firstName : 'Cuenta'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && mounted && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-primary">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </div>
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
                      {user.role === 'ADMIN' && (
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
                    </>
                  ) : (
                    <>
                      <a
                        href="/auth"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <MaterialIcon name="login" className="text-base" />
                        Iniciar Sesión
                      </a>
                      <a
                        href="/auth?register=1"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-200"
                      >
                        <MaterialIcon name="person_add" className="text-base" />
                        Registrarse
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mega Menu Nav - Desktop */}
        <nav aria-label="Categorías de productos" className="hidden lg:flex items-center gap-8 py-3 text-sm font-medium border-t border-primary/5">
          {navCategories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              className="relative group"
              onMouseEnter={() => setActiveMegaMenu(cat.id)}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="text-primary hover:text-primary/70 flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-primary/5 transition-colors"
              >
                {cat.name}
                {cat.children.length > 0 && (
                  <MaterialIcon name="expand_more" className="text-xs group-hover:rotate-180 transition-transform" />
                )}
              </Link>

              {/* Dropdown con subcategorías */}
              {activeMegaMenu === cat.id && cat.children.length > 0 && (
                <div className="absolute left-0 top-full min-w-max bg-white border border-slate-200 shadow-2xl z-50 rounded-lg">
                  <div className="px-6 py-5 min-w-72">
                    <h3 className="font-bold text-primary mb-3 text-sm uppercase tracking-wide">{cat.name}</h3>
                    <div className="space-y-1">
                      {cat.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                        >
                          <p className="text-sm font-semibold text-primary group-hover:text-primary/80">{child.name}</p>
                          {child.productCount > 0 && (
                            <span className="text-xs text-slate-400">{child.productCount}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="block mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-primary hover:text-primary/70 transition-colors"
                    >
                      Ver todo en {cat.name} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="h-4 w-px bg-primary/10 mx-2" />
          <Link href="/products" className="text-primary/60 hover:text-primary font-semibold transition-colors">
            Todos los Productos
          </Link>
        </nav>

      </div>
    </header>

    {/* Mobile Nav Overlay - FUERA DEL HEADER */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-[999] lg:hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Navigation Drawer */}
        <div className="relative z-[9999] h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl overflow-y-auto flex">
          {/* Header Section: Profile */}
          <div className="flex items-center gap-4 border-b border-primary/5 p-6">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
              {mounted && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : mounted && user?.firstName ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {user.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <img
                  alt="User Profile"
                  src={IMAGES.userAvatar}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <h2 className="truncate text-lg font-bold text-primary">
                {mounted && user?.firstName ? `${user.firstName} ${user.lastName}` : 'Invitado'}
              </h2>
              <p className="text-xs font-medium text-primary/60">
                {mounted && user ? user.email : 'Inicia sesión para continuar'}
              </p>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="text-primary/40 hover:text-primary transition-colors"
            >
              <MaterialIcon name="close" className="text-2xl" />
            </button>
          </div>

          {/* Search Bar Section */}
          <div className="px-6 py-4">
            <label className="relative flex items-center group">
              <MaterialIcon name="search" className="absolute left-3 text-primary/40 group-focus-within:text-primary transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(); setMobileMenuOpen(false); } }}
                className="w-full rounded-xl border-none bg-primary/5 py-3 pl-11 pr-4 text-sm font-medium text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-primary/20"
                placeholder="Buscar en FlexiCommerce"
                type="text"
              />
            </label>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {/* Main Categories */}
            <div className="mb-6">
              <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/40">Categorías</h3>
              <div className="flex flex-col gap-1">
                {navCategories.map((cat) => (
                  <details key={cat.id} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <MaterialIcon name="category" className="text-primary/70" />
                        <span className="text-sm font-semibold text-primary">{cat.name}</span>
                      </div>
                      {cat.children.length > 0 && (
                        <MaterialIcon name="expand_more" className="text-sm text-primary/30 group-open:rotate-180 transition-transform" />
                      )}
                    </summary>
                    {cat.children.length > 0 && (
                      <div className="ml-12 mt-1 flex flex-col gap-2 border-l border-primary/10 pl-4 py-2">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?category=${child.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm text-primary/60 hover:text-primary transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </details>
                ))}
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-primary/5 transition-colors"
                >
                  <MaterialIcon name="storefront" className="text-primary/70" />
                  <span className="text-sm font-semibold text-primary">Todos los Productos</span>
                </Link>
              </div>
            </div>

            {/* Quick Access Section */}
            <div className="mb-6 pt-4 border-t border-primary/5">
              <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/40">Mi Actividad</h3>
              <div className="flex flex-col gap-1">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-primary hover:bg-primary/5 transition-colors"
                >
                  <MaterialIcon name="favorite" className="text-primary/70" />
                  <span className="text-sm font-semibold">Lista de deseos</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-primary hover:bg-primary/5 transition-colors"
                >
                  <MaterialIcon name="shopping_bag" className="text-primary/70" />
                  <span className="text-sm font-semibold">Pedidos</span>
                </Link>
              </div>
            </div>

            {/* Account & Support */}
            <div className="pt-4 border-t border-primary/5">
              <h3 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/40">Soporte y Ajustes</h3>
              <div className="flex flex-col gap-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-primary hover:bg-primary/5 transition-colors"
                >
                  <MaterialIcon name="settings" className="text-primary/70" />
                  <span className="text-sm font-semibold">Ajustes</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Section: Language & Currency */}
          <div className="mt-auto border-t border-primary/5 bg-slate-50 p-4">
            <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
                  <MaterialIcon name="language" className="text-sm text-primary/70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary">ES / COP</span>
                  <span className="text-[10px] text-primary/40">Español · Colombia</span>
                </div>
              </div>
              <MaterialIcon name="chevron_right" className="text-primary/40" />
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
              <p className="text-[10px] text-primary/30">© 2026 FlexiCommerce</p>
              {mounted && user ? (
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
