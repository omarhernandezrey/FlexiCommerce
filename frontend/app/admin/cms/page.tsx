'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function CMSDashboardPage() {
  const stats = [
    { label: 'Total de Ventas', value: '$24,500.00', icon: 'trending_up', color: 'bg-green-100 text-green-600' },
    { label: 'Órdenes', value: '124', icon: 'shopping_bag', color: 'bg-blue-100 text-blue-600' },
    { label: 'Clientes', value: '856', icon: 'people', color: 'bg-purple-100 text-purple-600' },
    { label: 'Productos', value: '245', icon: 'inventory_2', color: 'bg-orange-100 text-orange-600' },
  ];

  const recentOrders = [
    { id: 'FCM-001234', customer: 'Juan Pérez', amount: '$299.00', status: 'Entregado' },
    { id: 'FCM-001233', customer: 'María García', amount: '$189.50', status: 'Enviando' },
    { id: 'FCM-001232', customer: 'Carlos López', amount: '$120.00', status: 'Pendiente' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">CMS Dashboard</h1>
        <p className="text-slate-600">Bienvenido a tu panel de administración</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <MaterialIcon name={stat.icon} />
            </div>
            <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-primary mb-6">Órdenes Recientes</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-background-light rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-primary">{order.id}</p>
                  <p className="text-sm text-slate-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{order.amount}</p>
                  <p className="text-xs text-slate-500">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-primary mb-6">Acciones Rápidas</h3>
          <div className="space-y-3">
            {[
              { icon: 'add_circle', label: 'Crear Nuevo Producto' },
              { icon: 'edit', label: 'Editar Contenido' },
              { icon: 'visibility', label: 'Ver Reportes' },
              { icon: 'person_add', label: 'Gestionar Usuarios' },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              >
                <MaterialIcon name={action.icon} className="text-primary" />
                <span className="font-semibold text-primary">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
