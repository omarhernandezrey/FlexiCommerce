'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import Link from 'next/link';

export default function AdminDashboard() {
  const { products, fetchAll: fetchProducts } = useProducts();
  const { orders, fetchAll: fetchOrders } = useOrdersAdmin();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  const stats = [
    {
      label: 'Total de Ventas',
      value: `$${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}`,
      icon: 'trending_up',
      color: 'bg-green-100',
    },
    {
      label: 'Órdenes Hoy',
      value: orders.filter((o) => {
        const today = new Date();
        const orderDate = new Date(o.createdAt || '');
        return orderDate.toDateString() === today.toDateString();
      }).length,
      icon: 'shopping_bag',
      color: 'bg-blue-100',
    },
    {
      label: 'Órdenes Pendientes',
      value: orders.filter((o) => o.status === 'pending').length,
      icon: 'schedule',
      color: 'bg-yellow-100',
    },
    {
      label: 'Productos',
      value: products.length,
      icon: 'inventory_2',
      color: 'bg-orange-100',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Dashboard Admin</h1>
        <p className="text-slate-600">Panel de control de FlexiCommerce</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((item) => (
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/admin/products"
          className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MaterialIcon name="inventory_2" className="text-2xl text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary mb-1">Gestionar Productos</h2>
              <p className="text-sm text-slate-600">{products.length} productos en tu catálogo</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MaterialIcon name="shopping_cart" className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary mb-1">Ver Órdenes</h2>
              <p className="text-sm text-slate-600">{orders.length} órdenes totales</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">Órdenes Recientes</h2>
            <Link href="/admin/orders" className="text-primary text-sm hover:underline">
              Ver todo
            </Link>
          </div>
          {orders.slice(0, 5).length === 0 ? (
            <p className="text-slate-600 text-center py-8">No hay órdenes aún</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-primary">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(order.createdAt || '').toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">Productos Destacados</h2>
            <Link href="/admin/products" className="text-primary text-sm hover:underline">
              Ver todo
            </Link>
          </div>
          {products.slice(0, 5).length === 0 ? (
            <p className="text-slate-600 text-center py-8">No hay productos aún</p>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-primary">{product.name}</p>
                    <p className="text-sm text-slate-600">Stock: {product.stock}</p>
                  </div>
                  <p className="font-bold text-primary ml-4">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
