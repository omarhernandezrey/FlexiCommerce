'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';

export default function AnalyticsPage() {
  const { metrics, dailySales, topProducts, loading, dateRange, fetchMetrics, fetchDailySales, fetchTopProducts, setDateRange, exportReport } = useAnalytics();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);

  useEffect(() => {
    fetchMetrics();
    fetchDailySales();
    fetchTopProducts();
  }, [dateRange, fetchMetrics, fetchDailySales, fetchTopProducts]);

  const handleDateChange = () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast({ message: 'Fecha de inicio debe ser anterior a fecha de fin', type: 'error' });
      return;
    }
    setDateRange(startDate, endDate);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await exportReport(format);
      toast({ message: `✅ Reporte ${format.toUpperCase()} descargado`, type: 'success' });
    } catch {
      toast({ message: `❌ Error descargando reporte ${format.toUpperCase()}`, type: 'error' });
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Analytics & Reportes</h1>
          <p className="text-slate-600">Visualiza métricas de ventas y desempeño de tu tienda</p>
        </div>

        {/* Date Range & Export */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleDateChange}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <MaterialIcon name="check" />
              Aplicar
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <MaterialIcon name="download" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <MaterialIcon name="picture_as_pdf" />
              PDF
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-blue-600 font-semibold">Ventas Totales</p>
                <MaterialIcon name="trending_up" className="text-blue-600 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-blue-900">${metrics.totalSales.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-purple-600 font-semibold">Total Órdenes</p>
                <MaterialIcon name="shopping_cart" className="text-purple-600 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-purple-900">{metrics.totalOrders}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-green-600 font-semibold">Ticket Promedio</p>
                <MaterialIcon name="account_balance_wallet" className="text-green-600 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-green-900">${metrics.averageOrderValue.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-orange-600 font-semibold">Clientes</p>
                <MaterialIcon name="people" className="text-orange-600 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-orange-900">{metrics.totalCustomers}</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6 border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-pink-600 font-semibold">Conv. Rate</p>
                <MaterialIcon name="percent" className="text-pink-600 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-pink-900">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Sales Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <MaterialIcon name="show_chart" />
                Ventas Diarias
              </h2>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : dailySales.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <p>Sin datos para mostrar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailySales.slice(-7).map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <p className="text-sm text-slate-600 w-24">{new Date(day.date).toLocaleDateString('es-ES')}</p>
                      <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-600 h-full flex items-center justify-end pr-3"
                          style={{
                            width: `${(day.sales / Math.max(...dailySales.map((d) => d.sales))) * 100}%`,
                          }}
                        >
                          <span className="text-xs font-bold text-white">${day.sales.toFixed(0)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 w-20 text-right">${day.sales.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <MaterialIcon name="star" />
              Top Productos
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {idx + 1}. {product.productName}
                      </p>
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{product.unitsSold} vendidos</span>
                    </div>
                    <p className="text-sm text-slate-600">${product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Products Table */}
        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <MaterialIcon name="table_chart" />
            Detalle de Productos
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Sin datos para mostrar</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Producto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Unidades Vendidas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Ingresos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{product.productName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{product.unitsSold}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">${product.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                            product.trend > 0
                              ? 'bg-green-100 text-green-800'
                              : product.trend < 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <MaterialIcon
                            name={product.trend > 0 ? 'trending_up' : product.trend < 0 ? 'trending_down' : 'trending_flat'}
                            className="text-base"
                          />
                          {product.trend > 0 ? '+' : ''}{product.trend}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
