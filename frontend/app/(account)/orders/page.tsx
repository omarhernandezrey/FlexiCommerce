'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useOrders } from '@/hooks/useOrders';
import { IMAGES } from '@/lib/constants';
import { formatCOP } from '@/lib/format';

// Tipo de visualización unificado
interface DisplayOrder {
  id: string;
  date: string;
  total: string;
  status: string;
  items: number;
  image: string;
}

const MOCK_ORDERS: DisplayOrder[] = [
  { id: 'FCM-2024-001234', date: '17 feb 2024', total: '$299.00', status: 'delivered', items: 1, image: IMAGES.userAvatar },
  { id: 'FCM-2024-001233', date: '15 feb 2024', total: '$189.50', status: 'shipping',  items: 1, image: IMAGES.userAvatar },
  { id: 'FCM-2024-001232', date: '10 feb 2024', total: '$120.00', status: 'pending',   items: 2, image: IMAGES.userAvatar },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En proceso',  color: 'bg-blue-100 text-blue-700' },
  confirmed: { label: 'Confirmado',  color: 'bg-indigo-100 text-indigo-700' },
  shipped:   { label: 'Enviado',     color: 'bg-yellow-100 text-yellow-700' },
  shipping:  { label: 'Enviado',     color: 'bg-yellow-100 text-yellow-700' },
  delivered: { label: 'Entregado',   color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado',   color: 'bg-gray-100 text-gray-600' },
};

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchId, setSearchId] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { orders: apiOrders, loading, fetchAll } = useOrders();

  useEffect(() => {
    fetchAll().catch(() => {/* usar datos de muestra */});
  }, [fetchAll]);

  const displayOrders: DisplayOrder[] = apiOrders.length > 0
    ? apiOrders.map((o) => ({
        id: o.id,
        date: new Date(o.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
        total: formatCOP(o.total),
        status: o.status,
        items: o.items.length,
        image: IMAGES.userAvatar,
      }))
    : MOCK_ORDERS;

  const filteredOrders = displayOrders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = searchId === '' || o.id.toLowerCase().includes(searchId.toLowerCase());

    let matchesDate = true;
    if (dateRange !== 'all') {
      const orderDate = new Date(o.date);
      const now = new Date();
      if (dateRange === '30d') {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 30);
        matchesDate = orderDate >= cutoff;
      } else if (dateRange === '3m') {
        const cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 3);
        matchesDate = orderDate >= cutoff;
      } else {
        matchesDate = orderDate.getFullYear().toString() === dateRange;
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['ID Pedido', 'Fecha', 'Estado', 'Artículos', 'Total'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.date,
      statusConfig[o.status]?.label ?? o.status,
      o.items.toString(),
      o.total,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="spacing-section">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Historial de Pedidos</h1>
          <p className="text-primary/60 text-sm mt-1">{displayOrders.length} pedidos en total</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredOrders.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-bold text-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MaterialIcon name="download" className="text-base" />
          Exportar CSV
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl border border-primary/10 p-4 spacing-section">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base" />
              <input
                type="text"
                placeholder="Buscar por ID de pedido..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-4 h-10 border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Rango de Fecha */}
            <div className="relative">
              <MaterialIcon name="calendar_today" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base pointer-events-none" />
              <select
                value={dateRange}
                onChange={(e) => handleFilterChange(setDateRange)(e.target.value)}
                className="appearance-none pl-9 pr-8 h-10 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white cursor-pointer"
              >
                <option value="all">Todo el tiempo</option>
                <option value="30d">Últimos 30 días</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <MaterialIcon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none text-base" />
            </div>
          </div>

          {/* Filtros de Estado */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all',       label: 'Todos' },
              { value: 'pending',   label: 'En proceso' },
              { value: 'shipped',   label: 'Enviado' },
              { value: 'delivered', label: 'Entregado' },
              { value: 'cancelled', label: 'Cancelado' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => handleFilterChange(setFilterStatus)(status.value)}
                className={`px-4 h-10 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
                  filterStatus === status.value
                    ? 'bg-primary text-white'
                    : 'border border-primary/10 text-primary/60 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton de carga */}
      {loading && displayOrders === MOCK_ORDERS && (
        <div className="spacing-section">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-primary/10 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-primary/10 rounded w-48" />
                  <div className="h-3 bg-primary/5 rounded w-32" />
                </div>
                <div className="h-8 bg-primary/10 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Pedidos */}
      {!loading && filteredOrders.length > 0 && (
        <div className="spacing-section">
          {paginatedOrders.map((order) => {
            const status = statusConfig[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-primary/10 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Imagen */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary/10 flex-shrink-0 bg-primary/5 flex items-center justify-center">
                    <img src={order.image} alt="Pedido" className="w-full h-full object-cover" />
                  </div>

                  {/* Detalles */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <p className="font-extrabold text-primary text-sm">{order.id}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-primary/40">{order.date}</p>
                    <p className="text-xs text-primary/60 mt-1">
                      {order.items} artículo{order.items !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total y Acción */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                    <p className="text-xl font-extrabold text-primary">{order.total}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors text-sm whitespace-nowrap"
                    >
                      Ver Detalles
                      <MaterialIcon name="arrow_forward" className="text-base" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-primary/10">
          <MaterialIcon name="shopping_bag" className="text-primary/20 text-6xl mb-4" />
          <p className="text-primary font-bold mb-2">No se encontraron pedidos</p>
          <p className="text-primary/40 text-sm mb-6">Intenta ajustar los filtros</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MaterialIcon name="storefront" className="text-base" />
            Ir a Comprar
          </Link>
        </div>
      )}

      {/* Paginación */}
      {!loading && filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <p className="text-sm text-primary/40">
            Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} de {filteredOrders.length} pedidos
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-semibold text-primary/60 hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MaterialIcon name="chevron_left" className="text-base" />
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`size-9 rounded-lg text-sm font-bold transition-colors ${
                    page === currentPage ? 'bg-primary text-white' : 'border border-primary/10 text-primary hover:bg-primary/5'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm font-semibold text-primary hover:border-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
                <MaterialIcon name="chevron_right" className="text-base" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Banner de Soporte */}
      <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <MaterialIcon name="support_agent" className="text-primary text-2xl" />
          </div>
          <div>
            <p className="font-extrabold text-primary">¿Necesitas ayuda con un pedido?</p>
            <p className="text-sm text-primary/60">Nuestro equipo de soporte está disponible 24/7</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href="mailto:support@flexicommerce.com"
            className="px-4 py-2 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors text-sm"
          >
            Centro de Ayuda
          </a>
          <a
            href="mailto:support@flexicommerce.com?subject=Order%20Support"
            className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Chatear con Soporte
          </a>
        </div>
      </div>
    </div>
  );
}
