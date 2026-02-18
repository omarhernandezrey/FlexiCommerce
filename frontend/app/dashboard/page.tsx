'use client';

import React from 'react';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/Sidebar';
import { StatCard, ChartContainer, DataTable } from '@/components/dashboard/Cards';
import {
  ShoppingCart,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  AlertCircle,
} from 'lucide-react';

// Mock data - replace with API calls
const stats = [
  {
    title: 'Ingresos Totales',
    value: '$12,543.50',
    change: 12.5,
    trend: 'up' as const,
    icon: <DollarSign className="w-6 h-6" />,
    color: 'green' as const,
  },
  {
    title: 'Pedidos',
    value: '342',
    change: 8.2,
    trend: 'up' as const,
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'blue' as const,
  },
  {
    title: 'Clientes',
    value: '1,284',
    change: 5.3,
    trend: 'up' as const,
    icon: <Users className="w-6 h-6" />,
    color: 'purple' as const,
  },
  {
    title: 'Productos',
    value: '85',
    change: -2.1,
    trend: 'down' as const,
    icon: <Package className="w-6 h-6" />,
    color: 'yellow' as const,
  },
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Juan Pérez',
    amount: '$245.99',
    status: 'Entregado',
    date: '2024-02-15',
  },
  {
    id: 'ORD-002',
    customer: 'María García',
    amount: '$189.50',
    status: 'En tránsito',
    date: '2024-02-14',
  },
  {
    id: 'ORD-003',
    customer: 'Carlos López',
    amount: '$312.75',
    status: 'Pendiente',
    date: '2024-02-14',
  },
  {
    id: 'ORD-004',
    customer: 'Ana Rodríguez',
    amount: '$95.25',
    status: 'Cancelado',
    date: '2024-02-13',
  },
];

const topProducts = [
  {
    name: 'Laptop Pro 15"',
    sales: 234,
    revenue: '$112,320',
    stock: 45,
  },
  {
    name: 'Mouse Inalámbrico',
    sales: 1205,
    revenue: '$36,150',
    stock: 342,
  },
  {
    name: 'Teclado Mecánico',
    sales: 856,
    revenue: '$42,800',
    stock: 128,
  },
  {
    name: 'Monitor 27"',
    sales: 342,
    revenue: '$68,400',
    stock: 89,
  },
];

const statusColors: Record<string, string> = {
  'Entregado': 'bg-green-100 text-green-800',
  'En tránsito': 'bg-blue-100 text-blue-800',
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'Cancelado': 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <DashboardHeader />

        {/* Content */}
        <main className="p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Bienvenido de vuelta, Admin</h2>
            <p className="text-gray-600 mt-2">Aquí está un resumen de tu tienda</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Alerts */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Advertencia de Stock</h4>
              <p className="text-sm text-yellow-800 mt-1">
                5 productos tienen stock bajo (menos de 50 unidades)
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <ChartContainer title="Pedidos Recientes" description="Últimas transacciones">
                <DataTable
                  columns={[
                    { key: 'id', label: 'Pedido' },
                    { key: 'customer', label: 'Cliente' },
                    { key: 'amount', label: 'Monto' },
                    {
                      key: 'status',
                      label: 'Estado',
                      render: (value) => (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[value] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {value}
                        </span>
                      ),
                    },
                    { key: 'date', label: 'Fecha' },
                  ]}
                  data={recentOrders}
                />
              </ChartContainer>
            </div>

            {/* Activity */}
            <div>
              <ChartContainer title="Actividad Rápida">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Visitas Hoy</span>
                    <span className="text-2xl font-bold text-blue-600">2,543</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Conversiones</span>
                    <span className="text-2xl font-bold text-green-600">8.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Carrito Promedio</span>
                    <span className="text-2xl font-bold text-purple-600">$87.50</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Tasa de Rebote</span>
                    <span className="text-2xl font-bold text-yellow-600">32%</span>
                  </div>
                </div>
              </ChartContainer>
            </div>
          </div>

          {/* Top Products */}
          <div>
            <ChartContainer title="Productos Más Vendidos" description="Últimos 30 días">
              <DataTable
                columns={[
                  { key: 'name', label: 'Producto' },
                  { key: 'sales', label: 'Ventas' },
                  { key: 'revenue', label: 'Ingresos' },
                  {
                    key: 'stock',
                    label: 'Stock',
                    render: (value) => (
                      <span className={value < 50 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {value} unidades {value < 50 && '⚠️'}
                      </span>
                    ),
                  },
                ]}
                data={topProducts}
              />
            </ChartContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
