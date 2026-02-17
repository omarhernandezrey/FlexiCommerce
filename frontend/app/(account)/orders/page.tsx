'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const orders = [
    {
      id: 'FCM-2024-001234',
      date: '17 Feb 2024',
      total: '$299.00',
      status: 'delivered',
      items: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGsRLZqCj7FPTBBjxRBIsAeCWi9IS2fOgBb2GtswkIb91SPBGd67oY_qXeVNoLs7hxAHHKLkm62G8xRgmoQkPpuq9R196SIDVxGNaMuFjgga0h4mZtpp6UJ7fLI9vFIYumBkt6P0jaXsGtkRlV5MgVDKzZ564IOgSSPeFkbHLtotiT1inZGj1NcudW1L_f8bJidqpsWVXE9N0dCy8hyXOqggp-4W7MS2tUQpBnlznJ4cTgrmyAvVVIgtq3118P9cs-U8l_uWZD6pc',
    },
    {
      id: 'FCM-2024-001233',
      date: '15 Feb 2024',
      total: '$189.50',
      status: 'shipping',
      items: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXTpVfxs1db62dokgKW758D77TDsVrhik1b_aLd5Ye3ogBXIo1XStPxpPoknzerd4ofRur1xQRSQvBrmSCsc0kprITAkRNjKvMbEH-6bXmBnzSt9h1Fym9uxPBvTJOiIp0FKH0IHFhjvXLqiKGIxwsKqp1xn0h15lbyR8THDHy8yGkqmZt9lRaaeuM0244zooz2tK5pLu8E2WY0RypRMtT_3_SBKAqBSuX7Rxu99KljBMAoT0vODTpz3_s_bLVYjjIv99WRTpQskk',
    },
    {
      id: 'FCM-2024-001232',
      date: '10 Feb 2024',
      total: '$120.00',
      status: 'pending',
      items: 2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3STeNq8civLDlVuPkmcTIQ4SDguNu93vf1LqpN1q4q-I2_Ko_hjWygl9plMApINyRVzOeWPmjmfoNBLH6Zg1hb_O5Ns03-I6A9938zh2TTXfwdCOZAviCeCRhPKXZTaOokCxgbsEekLITcAsWOSR29RwNeru0mUDeOAJSj7YGEOKdTKLz5Kr7mX2IJ3z0HsKqieOn47XbSTb2j9mBJbQ8A9eI4rJdwrw-2uQaj5F-61WjYBKdmDOZorXciPE3JuF38UIDNCfxvWw',
    },
  ];

  const statusLabels = {
    pending: 'Pendiente',
    shipping: 'Enviando',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shipping: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Mis Órdenes</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'shipping', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'Todas' : statusLabels[status as keyof typeof statusLabels]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Image */}
                <img
                  src={order.image}
                  alt="Order"
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-primary">{order.id}</p>
                      <p className="text-sm text-slate-600">{order.date}</p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {order.items} artículo{order.items !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Total and Action */}
                <div className="text-right flex md:flex-col md:items-end justify-between md:justify-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{order.total}</p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <MaterialIcon name="shopping_bag" className="text-slate-300 text-4xl mb-4" />
          <p className="text-slate-600 mb-4">No hay órdenes que mostrar</p>
          <Link
            href="/products"
            className="text-primary font-semibold hover:underline"
          >
            Ir a productos
          </Link>
        </div>
      )}
    </div>
  );
}
