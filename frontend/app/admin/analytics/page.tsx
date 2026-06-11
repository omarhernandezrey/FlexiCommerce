'use client';

import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import { formatCOP } from '@/lib/format';

export default function AnalyticsPage() {
  const { metrics, dailySales, topProducts, loading, error, dateRange, fetchMetrics, fetchDailySales, fetchTopProducts, setDateRange, exportReport } = useAnalytics();
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
      toast({ message: `Reporte ${format.toUpperCase()} descargado`, type: 'success' });
    } catch {
      toast({ message: `Error descargando reporte ${format.toUpperCase()}`, type: 'error' });
    }
  };

  const handleRetry = () => {
    fetchMetrics();
    fetchDailySales();
    fetchTopProducts();
  };

  const maxDailySales = Math.max(1, ...dailySales.map((d) => d.sales));

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MaterialIcon name="analytics" className="text-primary text-lg" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">Analytics & Reportes</h1>
          </div>
          <p className="text-slate-500 text-sm ml-[52px]">Metricas de ventas y desempeno de tu tienda</p>
        </div>

        {/* Date Range & Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleDateChange}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5"
              >
                <MaterialIcon name="check_circle" className="text-base" />
                Aplicar
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1.5"
              >
                <MaterialIcon name="download" className="text-base" />
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1.5"
              >
                <MaterialIcon name="description" className="text-base" />
                TXT
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
            <MaterialIcon name="error_outline" className="text-4xl text-red-400 mb-3" />
            <h3 className="font-bold text-primary text-lg mb-2">Error al cargar datos</h3>
            <p className="text-sm text-slate-500 mb-4 break-words">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MaterialIcon name="refresh" className="text-lg" />
              Reintentar
            </button>
          </div>
        )}

        {/* Metrics Cards */}
        {loading && !metrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-3 w-14 bg-slate-200 rounded" />
                  <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label: 'Ventas Totales', value: formatCOP(metrics.totalSales), icon: 'trending_up', color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Total Ordenes', value: String(metrics.totalOrders), icon: 'shopping_bag', color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Ticket Promedio', value: formatCOP(metrics.averageOrderValue), icon: 'account_balance_wallet', color: 'text-green-600', bg: 'bg-green-600/10' },
              { label: 'Clientes', value: String(metrics.totalCustomers), icon: 'people', color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Ordenes/Cliente', value: (metrics.ordersPerCustomer / 100).toFixed(1), icon: 'repeat', color: 'text-green-600', bg: 'bg-green-600/10' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-all overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-500 text-[11px] sm:text-xs font-medium truncate mr-1">{card.label}</p>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                    <MaterialIcon name={card.icon} className={`${card.color} text-sm sm:text-base`} />
                  </div>
                </div>
                <p className={`text-sm sm:text-base lg:text-lg font-bold ${card.color} truncate leading-tight`}>{card.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Sales Chart */}
          <div className="lg:col-span-2 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <MaterialIcon name="show_chart" className="text-primary" />
                Ventas Ultimos 7 Dias
              </h2>

              {loading && dailySales.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-b-transparent"></div>
                </div>
              ) : dailySales.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MaterialIcon name="bar_chart" className="text-3xl mb-2" />
                    <p className="text-sm">Sin datos de ventas en este periodo</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailySales.slice(-7).map((day, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3">
                      <p className="text-xs text-slate-500 font-medium w-16 sm:w-24 shrink-0 truncate">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <div className="flex-1 min-w-0">
                        <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-lg transition-all"
                            style={{ width: `${Math.max(3, (day.sales / maxDailySales) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">{formatCOP(day.sales)}</p>
                        <p className="text-[10px] text-slate-400">{day.orders} ord.</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <MaterialIcon name="star" className="text-primary" />
                Productos Top 5
              </h2>

              {loading && topProducts.length === 0 ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg animate-pulse">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-14 bg-slate-100 rounded" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <MaterialIcon name="inventory_2" className="text-3xl text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Sin datos de productos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-r from-slate-50 to-primary/5 rounded-lg border border-slate-200 hover:border-primary/30 transition-colors overflow-hidden">
                      <div className="flex items-center gap-2 mb-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                        <p className="text-sm font-semibold text-slate-900 truncate">{product.productName}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-green-600/10 text-green-600 px-2 py-0.5 rounded-full font-semibold">{product.unitsSold} vendidos</span>
                        <p className="text-xs font-bold text-primary whitespace-nowrap">{formatCOP(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <MaterialIcon name="table_chart" className="text-primary" />
            Detalle de Productos
          </h2>

          {loading && topProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-b-transparent mx-auto"></div>
            </div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-8">
              <MaterialIcon name="table_chart" className="text-3xl text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Sin datos para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <table className="w-full min-w-[400px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-primary">#</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-primary">Producto</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-primary">Uds.</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-primary">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 text-xs text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 sm:px-6 py-3 text-xs text-slate-900 font-semibold max-w-[200px] truncate">{product.productName}</td>
                      <td className="px-4 sm:px-6 py-3 text-xs text-slate-600 font-medium text-right">{product.unitsSold}</td>
                      <td className="px-4 sm:px-6 py-3 text-xs font-bold text-primary text-right whitespace-nowrap">{formatCOP(product.revenue)}</td>
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
