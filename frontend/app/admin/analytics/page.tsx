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
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MaterialIcon name="analytics" className="text-primary text-xl" />
              </div>
              <h1 className="text-4xl font-bold text-primary">Analytics & Reportes</h1>
            </div>
            <p className="text-slate-600 ml-15">Visualiza métricas de ventas y desempeño de tu tienda</p>
          </div>

          {/* Date Range & Export */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MaterialIcon name="calendar_today" className="inline text-lg mr-1" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
              <button
                onClick={handleDateChange}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MaterialIcon name="check_circle" className="text-lg" />
                Aplicar
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-success text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MaterialIcon name="download" className="text-lg" />
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-error text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MaterialIcon name="picture_as_pdf" className="text-lg" />
                PDF
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-600 text-sm font-medium">Ventas Totales</p>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name="trending_up" className="text-primary text-lg" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-primary">${metrics.totalSales.toFixed(0)}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-600 text-sm font-medium">Total Órdenes</p>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name="shopping_bag" className="text-primary text-lg" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-primary">{metrics.totalOrders}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-600 text-sm font-medium">Ticket Promedio</p>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <MaterialIcon name="account_balance_wallet" className="text-success text-lg" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-success">${metrics.averageOrderValue.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-600 text-sm font-medium">Clientes</p>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name="people" className="text-primary text-lg" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-primary">{metrics.totalCustomers}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-600 text-sm font-medium">Tasa de Conversión</p>
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <MaterialIcon name="percent" className="text-success text-lg" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-success">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Sales Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <MaterialIcon name="show_chart" className="text-primary" />
                  Ventas Últimos 7 Días
                </h2>

                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-b-transparent"></div>
                  </div>
                ) : dailySales.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    <p>Sin datos para mostrar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailySales.slice(-7).map((day, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <p className="text-sm text-slate-600 font-medium w-28">{new Date(day.date).toLocaleDateString('es-ES')}</p>
                        <div className="flex-1">
                          <div className="h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center">
                            <div
                              className="bg-gradient-to-r from-primary to-primary/60 h-full flex items-center justify-end pr-3 transition-all"
                              style={{
                                width: `${(day.sales / Math.max(...dailySales.map((d) => d.sales))) * 100}%`,
                              }}
                            >
                              <span className="text-xs font-bold text-white">${day.sales.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-primary w-20 text-right">${day.sales.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="star" className="text-primary" />
                Productos Top 5
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Sin datos</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-primary/5 rounded-lg border border-slate-200 hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <p className="text-sm font-semibold text-slate-900 truncate">{product.productName}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-semibold">{product.unitsSold} vendidos</span>
                        <p className="text-sm font-bold text-primary">${product.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Products Table */}
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <MaterialIcon name="table_chart" className="text-primary" />
              Detalle de Productos
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-b-transparent mx-auto"></div>
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Sin datos para mostrar</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Producto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Unidades Vendidas</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Ingresos</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {topProducts.map((product, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{product.productName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{product.unitsSold}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">${product.revenue.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                              product.trend > 0
                                ? 'bg-success/10 text-success'
                                : product.trend < 0
                                ? 'bg-error/10 text-error'
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
      </div>
    </ProtectedRoute>
  );
}
