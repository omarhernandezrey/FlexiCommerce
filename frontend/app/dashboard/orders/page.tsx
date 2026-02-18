'use client';

import React, { useState } from 'react';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/Sidebar';
import { ChartContainer, DataTable } from '@/components/dashboard/Cards';
import {
  Search,
  Filter,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'Juan Pérez',
    phone: '555-0001',
    total: '$245.99',
    items: 3,
    status: 'Entregado',
    date: '2024-02-15',
    progress: 100,
  },
  {
    id: 'ORD-002',
    customer: 'María García',
    phone: '555-0002',
    total: '$189.50',
    items: 2,
    status: 'En tránsito',
    date: '2024-02-14',
    progress: 75,
  },
  {
    id: 'ORD-003',
    customer: 'Carlos López',
    phone: '555-0003',
    total: '$312.75',
    items: 5,
    status: 'Procesando',
    date: '2024-02-14',
    progress: 50,
  },
  {
    id: 'ORD-004',
    customer: 'Ana Rodríguez',
    phone: '555-0004',
    total: '$95.25',
    items: 1,
    status: 'Pendiente',
    date: '2024-02-13',
    progress: 25,
  },
  {
    id: 'ORD-005',
    customer: 'Pedro Martínez',
    phone: '555-0005',
    total: '$456.80',
    items: 4,
    status: 'Cancelado',
    date: '2024-02-13',
    progress: 0,
  },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Procesando': 'bg-blue-100 text-blue-800',
    'En tránsito': 'bg-purple-100 text-purple-800',
    'Entregado': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    'Pendiente': <Package className="w-4 h-4" />,
    'Procesando': <Truck className="w-4 h-4" />,
    'En tránsito': <Truck className="w-4 h-4" />,
    'Entregado': <CheckCircle className="w-4 h-4" />,
    'Cancelado': <XCircle className="w-4 h-4" />,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className="p-6 lg:p-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pedidos</h2>
            <p className="text-gray-600 mt-1">Gestiona todos tus pedidos y entregas</p>
          </div>

          {/* Stats Mini */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">
            {[
              { label: 'Totales', value: '342', color: 'blue' },
              { label: 'Pendientes', value: '24', color: 'yellow' },
              { label: 'En Tránsito', value: '45', color: 'purple' },
              { label: 'Entregados', value: '273', color: 'green' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Procesando">Procesando</option>
                <option value="En tránsito">En tránsito</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <ChartContainer title={`Pedidos (${filteredOrders.length})`}>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{order.id}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusIcons[order.status]}
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Cliente</p>
                        <p className="font-semibold text-gray-900">{order.customer}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                        <p className="font-semibold text-gray-900">{order.total}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Ítems</p>
                        <p className="font-semibold text-gray-900">{order.items}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Fecha</p>
                        <p className="font-semibold text-gray-900">{order.date}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="mt-4 md:mt-0 md:ml-4 text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </ChartContainer>
        </main>
      </div>
    </div>
  );
}
