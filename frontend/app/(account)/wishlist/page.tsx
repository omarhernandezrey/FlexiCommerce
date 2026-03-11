'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { formatCOP } from '@/lib/format';

export default function WishlistPage() {
  const { items, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'wishlist' | 'compare' | 'alerts'>('wishlist');
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState<Record<string, boolean>>({});
  const [alertTargets, setAlertTargets] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('priceAlerts');
      if (stored) {
        const { enabled, targets } = JSON.parse(stored);
        setAlertsEnabled(enabled || {});
        setAlertTargets(targets || {});
      }
    } catch {
      // ignorar
    }
  }, []);

  const saveAlerts = (enabled: Record<string, boolean>, targets: Record<string, number>) => {
    localStorage.setItem('priceAlerts', JSON.stringify({ enabled, targets }));
  };

  const handleSetAlert = (itemId: string, targetPrice: number) => {
    const newEnabled = { ...alertsEnabled, [itemId]: !alertsEnabled[itemId] };
    const newTargets = { ...alertTargets, [itemId]: targetPrice };
    setAlertsEnabled(newEnabled);
    setAlertTargets(newTargets);
    saveAlerts(newEnabled, newTargets);
  };

  const handleEnableAllAlerts = () => {
    const allEnabled: Record<string, boolean> = {};
    const allTargets: Record<string, number> = { ...alertTargets };
    items.forEach((item) => {
      allEnabled[item.id] = true;
      if (!allTargets[item.id]) allTargets[item.id] = parseFloat((Number(item.price) * 0.9).toFixed(0));
    });
    setAlertsEnabled(allEnabled);
    setAlertTargets(allTargets);
    saveAlerts(allEnabled, allTargets);
  };

  const handleTargetChange = (itemId: string, value: number) => {
    const newTargets = { ...alertTargets, [itemId]: value };
    setAlertTargets(newTargets);
    saveAlerts(alertsEnabled, newTargets);
  };

  const [shareToast, setShareToast] = useState('');
  const handleShareList = async () => {
    const url = window.location.href;
    const text = `¡Mira mi lista de deseos en FlexiCommerce! ${url}`;
    if (navigator.share) {
      await navigator.share({ title: 'Mi Lista de Deseos', text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShareToast('¡Enlace copiado al portapapeles!');
      setTimeout(() => setShareToast(''), 2500);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
    }
  }, [isAuthenticated, user, router]);

  const toggleCompare = (id: string) => {
    setCompareItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-primary/10 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-64 border border-primary/10"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-primary/10">
        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MaterialIcon name="heart_broken" className="text-primary text-4xl" />
        </div>
        <h2 className="text-xl font-extrabold text-primary mb-2">Tu lista de deseos está vacía</h2>
        <p className="text-primary/60 text-sm mb-8 text-center max-w-xs">
          Guarda tus productos favoritos para acceder a ellos fácilmente
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MaterialIcon name="storefront" className="text-base" />
          Explorar Productos
        </Link>
      </div>
    );
  }

  const stats = {
    total: items.length,
    minPrice: Math.min(...items.map(item => item.price)),
    maxPrice: Math.max(...items.map(item => item.price)),
    totalValue: items.reduce((sum, item) => sum + item.price, 0),
  };

  return (
    <div className="spacing-section">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Mis Colecciones</h1>
          <p className="text-primary/60 text-sm mt-1">{items.length} artículos guardados</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleShareList}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
          >
            <MaterialIcon name={shareToast ? 'check' : 'share'} className="text-base" />
            {shareToast || 'Compartir Lista'}
          </button>
          {compareItems.length > 0 && (
            <button
              onClick={() => setActiveTab('compare')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <MaterialIcon name="compare_arrows" className="text-base" />
              Comparar ({compareItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 spacing-header">
        {[
          { label: 'Total de Artículos', value: stats.total, icon: 'favorite' },
          { label: 'Precio Mínimo', value: formatCOP(stats.minPrice), icon: 'arrow_downward' },
          { label: 'Precio Máximo', value: formatCOP(stats.maxPrice), icon: 'arrow_upward' },
          { label: 'Valor Total', value: formatCOP(stats.totalValue), icon: 'account_balance_wallet' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name={stat.icon} className="text-primary/40 text-base" />
              <p className="text-xs text-primary/40 font-medium">{stat.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-primary/10 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-primary text-primary'
              : 'border-transparent text-primary/40 hover:text-primary'
          }`}
        >
          <MaterialIcon name="favorite" className="text-base" />
          Lista de Deseos ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
            activeTab === 'compare'
              ? 'border-primary text-primary'
              : 'border-transparent text-primary/40 hover:text-primary'
          }`}
        >
          <MaterialIcon name="grid_view" className="text-base" />
          Comparar
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'border-primary text-primary'
              : 'border-transparent text-primary/40 hover:text-primary'
          }`}
        >
          <MaterialIcon name="history" className="text-base" />
          Alertas
        </button>
      </div>

      {/* Cuadrícula de Lista de Deseos */}
      {activeTab === 'wishlist' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MaterialIcon name="image_not_supported" className="text-primary/20 text-4xl" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id, item.productName)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-red-500 hover:bg-white transition-all shadow-sm"
                  >
                    <MaterialIcon name="favorite" filled className="text-base" />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded">
                      En Stock
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">
                    {item.category}
                  </p>
                  <h3 className="font-bold text-primary text-base line-clamp-1 mb-2">
                    {item.productName}
                  </h3>
                  <p className="text-lg font-extrabold text-primary mb-4">
                    {formatCOP(item.price)}
                  </p>

                  <div className="mt-auto space-y-2">
                    <Link
                      href={`/products/${item.productId}`}
                      className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                    >
                      <MaterialIcon name="shopping_cart" className="text-sm" />
                      Agregar rápido
                    </Link>
                    <label className="flex items-center justify-center gap-2 w-full py-2 border border-primary/10 rounded-lg text-xs font-semibold text-primary/60 cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        checked={compareItems.includes(item.id)}
                        onChange={() => toggleCompare(item.id)}
                        className="rounded border-primary/20 text-primary focus:ring-primary/20 size-4"
                      />
                      Agregar a Comparar
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Limpiar Todo */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => clearWishlist()}
              className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              <MaterialIcon name="delete_sweep" className="text-base" />
              Limpiar Lista
            </button>
          </div>
        </>
      )}

      {/* Pestaña de Comparación */}
      {activeTab === 'compare' && (
        <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
          {compareItems.length === 0 ? (
            <div className="py-16 text-center">
              <MaterialIcon name="grid_view" className="text-primary/20 text-5xl mb-4" />
              <p className="font-bold text-primary mb-2">Ningún artículo seleccionado para comparar</p>
              <p className="text-primary/60 text-sm mb-6">
                Selecciona artículos de tu lista de deseos para comparar especificaciones
              </p>
              <button
                onClick={() => setActiveTab('wishlist')}
                className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Ir a Lista de Deseos
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left p-4 bg-primary/5 w-40">
                      <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">Característica</span>
                    </th>
                    {items
                      .filter((item) => compareItems.includes(item.id))
                      .map((item) => (
                        <th key={item.id} className="p-4 text-center min-w-[180px] bg-primary/5">
                          <div className="flex flex-col items-center gap-2">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <span className="text-xs font-bold text-primary line-clamp-2">
                              {item.productName}
                            </span>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-primary/5">
                    <td colSpan={compareItems.length + 1} className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-primary/60">
                      Info General
                    </td>
                  </tr>
                  {[
                    { label: 'Precio', key: 'price' as const, format: (v: number | string) => typeof v === 'number' ? formatCOP(v) : String(v) },
                    { label: 'Categoría', key: 'category' as const, format: (v: number | string) => String(v) },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-primary/5">
                      <td className="p-4 text-sm font-bold text-primary/60 bg-primary/[0.02]">{row.label}</td>
                      {items
                        .filter((item) => compareItems.includes(item.id))
                        .map((item) => (
                          <td key={item.id} className="p-4 text-center text-sm font-bold text-primary">
                            {row.format(item[row.key as keyof typeof item] as number | string)}
                          </td>
                        ))}
                    </tr>
                  ))}
                  <tr className="bg-primary/5">
                    <td colSpan={compareItems.length + 1} className="px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-primary/60">
                      Disponibilidad
                    </td>
                  </tr>
                  <tr className="border-b border-primary/5">
                    <td className="p-4 text-sm font-bold text-primary/60 bg-primary/[0.02]">En Stock</td>
                    {items
                      .filter((item) => compareItems.includes(item.id))
                      .map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            Disponible
                          </span>
                        </td>
                      ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-primary/[0.02]"></td>
                    {items
                      .filter((item) => compareItems.includes(item.id))
                      .map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <Link
                            href={`/products/${item.productId}`}
                            className="block bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          >
                            Comprar Ahora
                          </Link>
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pestaña de Alertas de Precio */}
      {activeTab === 'alerts' && (
        <div className="spacing-section">
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <MaterialIcon name="notifications_active" className="text-primary text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-primary">Alertas de Bajada de Precio</h3>
              <p className="text-sm text-primary/60 mt-0.5">
                Recibe notificaciones por correo cuando baje el precio de tus artículos guardados.
              </p>
            </div>
            <button
              onClick={handleEnableAllAlerts}
              className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              {Object.values(alertsEnabled).every(Boolean) && items.length > 0 ? 'Todas las Alertas Activas' : 'Activar Todas las Alertas'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 hover:bg-primary/[0.02] transition-colors ${
                  idx !== items.length - 1 ? 'border-b border-primary/5' : ''
                }`}
              >
                <div className="size-14 rounded-lg overflow-hidden border border-primary/10 shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <MaterialIcon name="image_not_supported" className="text-primary/20" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-primary line-clamp-1">{item.productName}</p>
                  <p className="text-xs text-primary/40 mt-0.5">{item.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-extrabold text-primary">{formatCOP(item.price)}</p>
                    <span className="text-[10px] text-primary/40 font-medium">Precio actual</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs font-bold text-primary/40">Alertar cuando baje de</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-sm">$</span>
                    <input
                      type="number"
                      value={alertTargets[item.id] ?? parseFloat((Number(item.price) * 0.9).toFixed(0))}
                      onChange={(e) => handleTargetChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-24 pl-6 pr-3 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSetAlert(item.id, alertTargets[item.id] ?? parseFloat((Number(item.price) * 0.9).toFixed(0)))}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    alertsEnabled[item.id]
                      ? 'bg-primary text-white border border-primary'
                      : 'text-primary border border-primary/20 hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  <MaterialIcon name={alertsEnabled[item.id] ? 'notifications_active' : 'notifications'} className="text-sm" />
                  {alertsEnabled[item.id] ? 'Alerta Activa' : 'Activar Alerta'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <MaterialIcon name="info" className="text-blue-500 text-base mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 font-medium">
              Las alertas de precio se envían a tu correo registrado. Puedes desactivarlas en cualquier momento desde la configuración de notificaciones.
            </p>
          </div>
        </div>
      )}

      {/* Cajón móvil de comparación */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary/10 p-4 flex items-center justify-between shadow-xl z-40 lg:hidden">
          <div className="flex items-center gap-2">
            {items
              .filter((item) => compareItems.includes(item.id))
              .map((item) => (
                <div key={item.id} className="size-10 rounded-lg overflow-hidden border border-primary/10">
                  <img src={item.image || ''} alt={item.productName} className="w-full h-full object-cover" />
                </div>
              ))}
            <span className="text-sm font-bold text-primary">{compareItems.length} seleccionados</span>
          </div>
          <button
            onClick={() => setActiveTab('compare')}
            className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Comparar
          </button>
        </div>
      )}
    </div>
  );
}
