'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard Admin</h1>
        <p className="text-slate-600">Panel de control de FlexiCommerce</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total de Ventas', value: '$24,500.00', icon: 'trending_up', color: 'bg-green-100' },
          { label: 'Órdenes Hoy', value: '12', icon: 'shopping_bag', color: 'bg-blue-100' },
          { label: 'Clientes Nuevos', value: '45', icon: 'person_add', color: 'bg-purple-100' },
          { label: 'Productos', value: '245', icon: 'inventory_2', color: 'bg-orange-100' },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.color} rounded-lg p-6 border border-slate-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">{item.label}</p>
                <p className="text-3xl font-bold text-primary">{item.value}</p>
              </div>
              <MaterialIcon name={item.icon} className="text-primary text-3xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
        <MaterialIcon name="apps" className="text-slate-300 text-6xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary mb-2">Bienvenido al Dashboard</h2>
        <p className="text-slate-600">
          Selecciona una sección del menú lateral para gestionar tu tienda
        </p>
      </div>
    </div>
  );
}
