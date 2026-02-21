'use client';

import { useEffect, useState } from 'react';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import Link from 'next/link';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800', icon: 'hourglass_top' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800', icon: 'check_circle' },
  shipped: { label: 'Enviada', color: 'bg-purple-100 text-purple-800', icon: 'local_shipping' },
  delivered: { label: 'Entregada', color: 'bg-green-100 text-green-800', icon: 'done_all' },
  cancelled: { label: 'Cancelada', color: 'bg-slate-100 text-slate-800', icon: 'cancel' },
};

export default function AdminOrdersPage() {
  const { orders, loading, error, fetchAll } = useOrdersAdmin();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MaterialIcon name="shopping_bag" className="text-primary text-xl" />
              </div>
              <h1 className="text-4xl font-bold text-primary">Gestión de Órdenes</h1>
            </div>
            <p className="text-slate-600 ml-15">Administra y controla todas las órdenes de tu tienda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total de Órdenes</p>
                  <p className="text-4xl font-bold text-primary mt-2">{orders.length}</p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="receipt_long" className="text-primary text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pendientes</p>
                  <p className="text-4xl font-bold text-warning mt-2">{pendingCount}</p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-warning/10 flex items-center justify-center">
                  <MaterialIcon name="hourglass_top" className="text-warning text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Entregadas</p>
                  <p className="text-4xl font-bold text-success mt-2">{deliveredCount}</p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-success/10 flex items-center justify-center">
                  <MaterialIcon name="done_all" className="text-success text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-primary mt-2">${totalRevenue.toFixed(0)}</p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="trending_up" className="text-primary text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MaterialIcon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Buscar por ID de orden o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
              <div className="relative">
                <MaterialIcon name="filter_list" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="">Todos los Estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="shipped">Enviada</option>
                  <option value="delivered">Entregada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-b-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando órdenes...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <MaterialIcon name="error" className="text-error text-6xl mx-auto mb-4" />
                <p className="text-error font-semibold">{error}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <MaterialIcon name="shopping_bag" className="text-slate-300 text-6xl mx-auto mb-4" />
                <p className="text-slate-600 text-lg">
                  {searchTerm || filterStatus ? 'No se encontraron órdenes' : 'No hay órdenes aún'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">ID Orden</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Usuario</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Items</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Fecha</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-primary">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map((order) => {
                      const orderStatus = order.status as keyof typeof statusConfig;
                      const statusInfo = statusConfig[orderStatus] || statusConfig.pending;
                      return (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-primary font-mono text-sm">{order.id.slice(0, 8)}...</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{order.userId.slice(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-primary text-lg">
                              ${order.total.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                              <MaterialIcon name="shopping_bag" className="text-lg" />
                              {order.items.length}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1 ${statusInfo.color}`}>
                              <MaterialIcon name={statusInfo.icon} className="text-base" />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(order.createdAt || '').toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 font-semibold text-sm inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MaterialIcon name="visibility" className="text-base" />
                              Ver Detalles
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 text-center text-slate-600 text-sm">
              Mostrando <span className="font-semibold text-primary">{filteredOrders.length}</span> de <span className="font-semibold text-primary">{orders.length}</span> órdenes
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
