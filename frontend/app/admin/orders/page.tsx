'use client';

import { useEffect, useState } from 'react';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import Link from 'next/link';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      shipped: 'Enviada',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Gestión de Órdenes</h1>
          <p className="text-slate-600">Administra todas las órdenes de tu tienda</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MaterialIcon name="search" className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID de orden o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Todos los Estados --</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="shipped">Enviada</option>
            <option value="delivered">Entregada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <MaterialIcon name="error" className="text-4xl mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <MaterialIcon name="shopping_bag" className="text-slate-300 text-6xl mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm || filterStatus ? 'No se encontraron órdenes' : 'No hay órdenes aún'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">ID Orden</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-primary">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.userId.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.items.length} producto(s)</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt || '').toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-semibold flex items-center gap-1 w-fit"
                      >
                        <MaterialIcon name="visibility" className="text-base" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Total de Órdenes</p>
            <p className="text-3xl font-bold text-blue-900">{orders.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-900">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 mb-1">Entregadas</p>
            <p className="text-3xl font-bold text-green-900">
              {orders.filter((o) => o.status === 'delivered').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-purple-900">
              ${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
