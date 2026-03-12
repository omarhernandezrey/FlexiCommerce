'use client';

import { useEffect, useState, useMemo } from 'react';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { formatCOP } from '@/lib/format';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
}

interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  avgOrdersPerCustomer: number;
  maxOrdersPerCustomer: number;
}

interface CategoryRevenue {
  category: string;
  orderCount: number;
  totalUnits: number;
  revenue: number;
}

// ─── Status ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', PROCESSING: 'Procesando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
  pending: 'Pendiente', confirmed: 'Confirmado', processing: 'Procesando',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700', SHIPPED: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { orders, fetchAll: fetchOrders } = useOrdersAdmin();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('FlexiCommerce');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  // ── Cargar datos reales ────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
    setLoading(true);

    Promise.allSettled([
      apiClient.get('/api/analytics/metrics'),
      apiClient.get('/api/products/stats'),
      apiClient.get('/api/analytics/top-products?limit=5'),
      apiClient.get('/api/admin/settings'),
      apiClient.get('/api/analytics/daily-sales?limit=14'),
      apiClient.get('/api/analytics/customer-stats'),
      apiClient.get('/api/analytics/revenue-by-category'),
      apiClient.get('/api/users'),
    ]).then(([metricsRes, statsRes, topRes, settingsRes, dailyRes, custRes, catRes, usersRes]) => {
      const extract = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled' ? ((r.value.data as any)?.data ?? r.value.data) : null;

      const m = extract(metricsRes);
      if (m) setMetrics(m);

      const s = extract(statsRes);
      if (s) setProductStats(s);

      const t = extract(topRes);
      if (Array.isArray(t)) setTopProducts(t);

      const settings = extract(settingsRes);
      if (settings?.storeName) setStoreName(settings.storeName);
      if (typeof settings?.maintenanceMode === 'boolean') setMaintenanceMode(settings.maintenanceMode);

      const daily = extract(dailyRes);
      if (Array.isArray(daily)) setDailySales(daily);

      const cust = extract(custRes);
      if (cust) setCustomerStats(cust);

      const cat = extract(catRes);
      if (Array.isArray(cat)) setCategoryRevenue(cat);

      const users = extract(usersRes);
      if (Array.isArray(users)) setTotalUsers(users.length);

      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Datos derivados de órdenes
  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const key = (o.status as string).toUpperCase();
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [orders]);

  const pendingOrders = ordersByStatus['PENDING'] || 0;
  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => new Date(o.createdAt || '').toDateString() === today).length;
  }, [orders]);

  // ── Sparkline de ventas diarias
  const sparklineMax = useMemo(() => Math.max(...dailySales.map((d) => d.sales), 1), [dailySales]);
  const todaySales = dailySales.length > 0 ? dailySales[dailySales.length - 1] : null;
  const yesterdaySales = dailySales.length > 1 ? dailySales[dailySales.length - 2] : null;
  const salesTrend = todaySales && yesterdaySales && yesterdaySales.sales > 0
    ? ((todaySales.sales - yesterdaySales.sales) / yesterdaySales.sales * 100) : 0;

  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Panel de Control</h1>
          <p className="text-primary/60 text-sm mt-1">Resumen general de {storeName}</p>
        </div>
        <div className="flex items-center gap-3">
          {maintenanceMode && (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
              <MaterialIcon name="construction" className="text-sm" /> Mantenimiento
            </span>
          )}
          <span className="text-primary/40 text-xs">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Totales */}
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-start justify-between mb-3">
            <div className="size-10 bg-white rounded-lg flex items-center justify-center text-green-600">
              <MaterialIcon name="trending_up" className="text-xl" />
            </div>
            {salesTrend !== 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${salesTrend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <MaterialIcon name={salesTrend > 0 ? 'arrow_upward' : 'arrow_downward'} className="text-[10px]" />
                {Math.abs(salesTrend).toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-xs text-primary/60 font-medium mb-1">Ventas Totales</p>
          {loading ? <Skeleton className="h-8 w-28 mb-1" /> : (
            <p className="text-2xl font-extrabold text-primary">{formatCOP(metrics?.totalSales ?? 0)}</p>
          )}
          <p className="text-[11px] text-primary/40 mt-1">
            {metrics ? `${metrics.totalOrders} órdenes · Promedio ${formatCOP(metrics.averageOrderValue)}` : 'Cargando...'}
          </p>
        </div>

        {/* Productos */}
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start justify-between mb-3">
            <div className="size-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
              <MaterialIcon name="inventory_2" className="text-xl" />
            </div>
            {productStats && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${productStats.outOfStock === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {productStats.outOfStock === 0 ? 'Stock OK' : `${productStats.outOfStock} agotados`}
              </span>
            )}
          </div>
          <p className="text-xs text-primary/60 font-medium mb-1">Productos</p>
          {loading ? <Skeleton className="h-8 w-16 mb-1" /> : (
            <p className="text-2xl font-extrabold text-primary">{productStats?.total ?? 0}</p>
          )}
          <p className="text-[11px] text-primary/40 mt-1">
            {productStats ? `${productStats.active} activos · ${productStats.lowStock} stock bajo` : 'Cargando...'}
          </p>
        </div>

        {/* Órdenes */}
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
          <div className="flex items-start justify-between mb-3">
            <div className="size-10 bg-white rounded-lg flex items-center justify-center text-yellow-600">
              <MaterialIcon name="pending_actions" className="text-xl" />
            </div>
            {todayOrders > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                {todayOrders} hoy
              </span>
            )}
          </div>
          <p className="text-xs text-primary/60 font-medium mb-1">Órdenes Pendientes</p>
          {loading ? <Skeleton className="h-8 w-12 mb-1" /> : (
            <p className="text-2xl font-extrabold text-primary">{pendingOrders}</p>
          )}
          <p className="text-[11px] text-primary/40 mt-1">{orders.length} total en el sistema</p>
        </div>

        {/* Clientes / Usuarios */}
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-start justify-between mb-3">
            <div className="size-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
              <MaterialIcon name="people" className="text-xl" />
            </div>
            {customerStats && customerStats.newCustomers > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                +{customerStats.newCustomers} nuevos
              </span>
            )}
          </div>
          <p className="text-xs text-primary/60 font-medium mb-1">Usuarios Registrados</p>
          {loading ? <Skeleton className="h-8 w-12 mb-1" /> : (
            <p className="text-2xl font-extrabold text-primary">{totalUsers ?? customerStats?.totalCustomers ?? 0}</p>
          )}
          <p className="text-[11px] text-primary/40 mt-1">
            {customerStats ? `${customerStats.avgOrdersPerCustomer.toFixed(1)} órdenes/cliente promedio` : 'Cargando...'}
          </p>
        </div>
      </div>

      {/* ── Sparkline ventas + Inventario ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini gráfico de ventas últimos 14 días */}
        <div className="bg-white rounded-xl border border-primary/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold text-primary text-sm">Ventas Últimos 14 Días</h2>
              <p className="text-xs text-primary/40 mt-0.5">
                {todaySales ? `Hoy: ${formatCOP(todaySales.sales)} (${todaySales.orders} órdenes)` : 'Sin datos hoy'}
              </p>
            </div>
            <Link href="/admin/analytics" className="text-xs font-bold text-primary hover:text-primary/70 flex items-center gap-1">
              Ver detalle <MaterialIcon name="arrow_forward" className="text-xs" />
            </Link>
          </div>
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : dailySales.length === 0 ? (
            <div className="h-20 flex items-center justify-center text-primary/30 text-sm">Sin datos de ventas</div>
          ) : (
            <div className="flex items-end gap-1 h-20">
              {dailySales.map((day, i) => {
                const height = Math.max(4, (day.sales / sparklineMax) * 100);
                const isToday = i === dailySales.length - 1;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {new Date(day.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {formatCOP(day.sales)}
                    </div>
                    <div
                      className={`w-full rounded-sm transition-all ${isToday ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventario */}
        {productStats ? (
          <div className="bg-white rounded-xl border border-primary/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-extrabold text-primary text-sm">Valor del Inventario</h2>
                <p className="text-xl font-extrabold text-primary mt-1">{formatCOP(productStats.totalValue)}</p>
              </div>
              <div className="size-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <MaterialIcon name="account_balance_wallet" className="text-emerald-600 text-xl" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Activos', value: productStats.active, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Inactivos', value: productStats.inactive, color: 'text-slate-500', bg: 'bg-slate-50' },
                { label: 'Sin stock', value: productStats.outOfStock, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Stock bajo', value: productStats.lowStock, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-lg p-3 text-center`}>
                  <p className={`text-xl font-extrabold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-primary/50 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl border border-primary/10 p-5">
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Estado de Órdenes (distribución real) ────────────────────────────── */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-primary/10 p-5">
          <h2 className="font-extrabold text-primary text-sm mb-4">Distribución de Órdenes por Estado</h2>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-slate-100">
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => {
              const count = ordersByStatus[status] || 0;
              if (count === 0) return null;
              const pct = (count / orders.length) * 100;
              const barColors: Record<string, string> = {
                PENDING: 'bg-yellow-400', CONFIRMED: 'bg-blue-400', PROCESSING: 'bg-indigo-400',
                SHIPPED: 'bg-cyan-400', DELIVERED: 'bg-green-400', CANCELLED: 'bg-red-400',
              };
              return (
                <div key={status} className={`${barColors[status]} transition-all relative group`} style={{ width: `${pct}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {STATUS_LABELS[status]} · {count} ({pct.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => {
              const count = ordersByStatus[status] || 0;
              if (count === 0) return null;
              const dotColors: Record<string, string> = {
                PENDING: 'bg-yellow-400', CONFIRMED: 'bg-blue-400', PROCESSING: 'bg-indigo-400',
                SHIPPED: 'bg-cyan-400', DELIVERED: 'bg-green-400', CANCELLED: 'bg-red-400',
              };
              return (
                <span key={status} className="flex items-center gap-1.5 text-xs text-primary/60">
                  <span className={`size-2 rounded-full ${dotColors[status]}`} />
                  {STATUS_LABELS[status]}: <span className="font-bold text-primary">{count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Links ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/admin/products', icon: 'inventory_2', color: 'bg-orange-100 text-orange-600', label: 'Productos', detail: productStats ? `${productStats.total} total` : '...' },
          { href: '/admin/orders', icon: 'shopping_cart', color: 'bg-blue-100 text-blue-600', label: 'Órdenes', detail: `${orders.length} total` },
          { href: '/admin/categories', icon: 'category', color: 'bg-teal-100 text-teal-600', label: 'Categorías', detail: 'Gestionar' },
          { href: '/admin/cms', icon: 'dashboard_customize', color: 'bg-indigo-100 text-indigo-600', label: 'Constructor', detail: 'Página inicio' },
          { href: '/admin/settings', icon: 'settings', color: 'bg-slate-100 text-slate-600', label: 'Configuración', detail: 'Marca y ajustes' },
          { href: '/admin/analytics', icon: 'bar_chart', color: 'bg-purple-100 text-purple-600', label: 'Analíticas', detail: 'Reportes' },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="bg-white rounded-xl border border-primary/10 p-3.5 hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center text-center gap-2">
            <div className={`size-10 rounded-xl flex items-center justify-center ${link.color}`}>
              <MaterialIcon name={link.icon} className="text-xl" />
            </div>
            <div>
              <p className="font-bold text-primary text-xs">{link.label}</p>
              <p className="text-[10px] text-primary/40">{link.detail}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Órdenes Recientes + Top Productos ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Recientes */}
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-primary">Órdenes Recientes</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-primary hover:text-primary/70 flex items-center gap-1">
              Ver todas <MaterialIcon name="arrow_forward" className="text-xs" />
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <MaterialIcon name="receipt_long" className="text-primary/20 text-4xl mb-2" />
              <p className="text-primary/40 text-sm">Sin órdenes aún</p>
            </div>
          ) : (
            <div className="space-y-1">
              {orders.slice(0, 6).map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary/40 group-hover:bg-primary/10 transition-colors">
                      <MaterialIcon name="receipt" className="text-sm" />
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">#{order.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-primary/40">
                        {new Date(order.createdAt || '').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <p className="font-extrabold text-primary text-sm min-w-[80px] text-right">{formatCOP(order.total)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Productos */}
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-primary">Productos Más Vendidos</h2>
            <Link href="/admin/analytics" className="text-xs font-bold text-primary hover:text-primary/70 flex items-center gap-1">
              Ver análisis <MaterialIcon name="arrow_forward" className="text-xs" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="flex-1 h-5" />
                  <Skeleton className="w-24 h-5" />
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8">
              <MaterialIcon name="inventory_2" className="text-primary/20 text-4xl mb-2" />
              <p className="text-primary/40 text-sm">Sin datos de ventas aún</p>
              <p className="text-primary/30 text-xs mt-1">Aparecerán cuando se procesen órdenes</p>
            </div>
          ) : (
            <div className="space-y-1">
              {topProducts.map((product, idx) => {
                const maxRev = topProducts[0]?.revenue || 1;
                const pct = (product.revenue / maxRev) * 100;
                return (
                  <div key={product.productId} className="flex items-center gap-3 py-2.5">
                    <span className="text-sm w-7 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-primary/30 font-bold">{idx + 1}</span>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-primary text-sm truncate mr-2">{product.productName}</p>
                        <p className="font-extrabold text-primary text-sm whitespace-nowrap">{formatCOP(product.revenue)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/30 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-primary/40 whitespace-nowrap">{product.unitsSold} uds</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue por Categoría (si hay datos) ────────────────────────────── */}
      {categoryRevenue.length > 0 && (
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-primary">Ingresos por Categoría</h2>
            <Link href="/admin/analytics" className="text-xs font-bold text-primary hover:text-primary/70 flex items-center gap-1">
              Ver análisis <MaterialIcon name="arrow_forward" className="text-xs" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categoryRevenue.map((cat) => (
              <div key={cat.category} className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-primary/60 font-medium mb-1">{cat.category}</p>
                <p className="text-lg font-extrabold text-primary">{formatCOP(cat.revenue)}</p>
                <p className="text-[10px] text-primary/40 mt-1">{cat.orderCount} órdenes · {cat.totalUnits} unidades</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
