'use client';

import React, { useState } from 'react';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard/Sidebar';
import { ChartContainer, StatCard } from '@/components/dashboard/Cards';
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
} from 'lucide-react';

const reportData = {
  revenue: [
    { month: 'Enero', value: 8500 },
    { month: 'Febrero', value: 12300 },
    { month: 'Marzo', value: 10800 },
    { month: 'Abril', value: 15200 },
    { month: 'Mayo', value: 13900 },
    { month: 'Junio', value: 18500 },
  ],
  topCategories: [
    { name: 'Electrónica', value: 45 },
    { name: 'Accesorios', value: 30 },
    { name: 'Software', value: 15 },
    { name: 'Servicios', value: 10 },
  ],
  customerSegments: [
    { segment: 'VIP', count: 45, percentage: 15 },
    { segment: 'Regular', count: 189, percentage: 63 },
    { segment: 'Nuevo', count: 66, percentage: 22 },
  ],
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');

  const keyMetrics = [
    {
      title: 'Ingresos Totales',
      value: '$78,900',
      change: 25.5,
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green' as const,
    },
    {
      title: 'Total de Órdenes',
      value: '1,234',
      change: 12.3,
      trend: 'up' as const,
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Nuevos Clientes',
      value: '234',
      change: 8.7,
      trend: 'up' as const,
      icon: <Users className="w-6 h-6" />,
      color: 'purple' as const,
    },
    {
      title: 'Tasa de Conversión',
      value: '3.45%',
      change: -0.5,
      trend: 'down' as const,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'yellow' as const,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Reportes</h2>
              <p className="text-gray-600 mt-1">Análisis detallado de tu negocio</p>
            </div>
            <button className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold">
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400 hidden md:block" />
              <div className="flex gap-2">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                      dateRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range === 'day' ? 'Hoy' : range === 'week' ? 'Esta Semana' : range === 'month' ? 'Este Mes' : 'Este Año'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyMetrics.map((metric, idx) => (
              <StatCard key={idx} {...metric} />
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <ChartContainer title="Ingresos por Mes" description="Últimos 6 meses">
              <div className="space-y-4">
                {reportData.revenue.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.month}</span>
                      <span className="text-sm font-bold text-gray-900">${item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full"
                        style={{ width: `${(item.value / 20000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>

            {/* Top Categories */}
            <ChartContainer title="Categorías Principales" description="Por volumen de ventas">
              <div className="space-y-4">
                {reportData.topCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        <span className="text-sm font-bold text-gray-900">{cat.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                          style={{ width: `${cat.value}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Segments */}
            <ChartContainer title="Segmentos de Clientes">
              <div className="space-y-4">
                {reportData.customerSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{seg.segment}</h4>
                      <span className="text-xl font-bold text-blue-600">{seg.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${seg.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{seg.percentage}% del total</p>
                  </div>
                ))}
              </div>
            </ChartContainer>

            {/* Key Performance Indicators */}
            <ChartContainer title="KPIs" description="Indicadores clave de desempeño">
              <div className="space-y-4">
                {[
                  { label: 'Ticket Promedio', value: '$87.50', trend: '+2.3%' },
                  { label: 'Tasa de Devolución', value: '2.1%', trend: '-0.5%' },
                  { label: 'Satisfacción Cliente', value: '4.8/5', trend: '+0.2' },
                  { label: 'Tiempo Entrega Prom.', value: '2.3 días', trend: '+0.1' },
                ].map((kpi, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{kpi.label}</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-green-600">{kpi.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>

            {/* Recent Activity */}
            <ChartContainer title="Actividad Reciente">
              <div className="space-y-3">
                {[
                  { event: 'Nueva orden', time: 'Hace 5 min', icon: '📦' },
                  { event: 'Cliente registrado', time: 'Hace 12 min', icon: '👤' },
                  { event: 'Pago recibido', time: 'Hace 23 min', icon: '💰' },
                  { event: 'Producto agotado', time: 'Hace 1 hora', icon: '⚠️' },
                  { event: 'Envío completado', time: 'Hace 2 horas', icon: '✅' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2">
                    <span className="text-xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
