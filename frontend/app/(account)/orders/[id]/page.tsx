'use client';

import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = {
    id: params.id,
    date: '17 de Febrero de 2024',
    status: 'delivered',
    total: 299.0,
    items: [
      {
        id: '1',
        name: 'Acoustic Pro-X Wireless',
        price: 299.0,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGsRLZqCj7FPTBBjxRBIsAeCWi9IS2fOgBb2GtswkIb91SPBGd67oY_qXeVNoLs7hxAHHKLkm62G8xRgmoQkPpuq9R196SIDVxGNaMuFjgga0h4mZtpp6UJ7fLI9vFIYumBkt6P0jaXsGtkRlV5MgVDKzZ564IOgSSPeFkbHLtotiT1inZGj1NcudW1L_f8bJidqpsWVXE9N0dCy8hyXOqggp-4W7MS2tUQpBnlznJ4cTgrmyAvVVIgtq3118P9cs-U8l_uWZD6pc',
      },
    ],
    shipping: {
      name: 'Juan Pérez',
      address: 'Calle Principal 123',
      city: 'Madrid',
      zipCode: '28001',
      country: 'España',
    },
    timeline: [
      { date: '17 Feb 2024', status: 'Orden confirmada', completed: true },
      { date: '18 Feb 2024', status: 'Procesando', completed: true },
      { date: '19 Feb 2024', status: 'Enviado', completed: true },
      { date: '20 Feb 2024', status: 'Entregado', completed: true },
    ],
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Mis Órdenes', href: '/orders' },
            { label: order.id },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">{order.id}</h1>
            <p className="text-slate-600">{order.date}</p>
          </div>
          <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold w-fit mt-4 md:mt-0">
            Entregado
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-2xl font-bold text-primary mb-6">Artículos</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">{item.name}</h4>
                      <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                      <p className="font-bold text-primary mt-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-2xl font-bold text-primary mb-6">Seguimiento</h3>
              <div className="space-y-4">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          step.completed
                            ? 'bg-success text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step.completed ? (
                          <MaterialIcon name="check" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {idx < order.timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold text-primary">{step.status}</p>
                      <p className="text-sm text-slate-600">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-2xl font-bold text-primary mb-6">Información de Envío</h3>
              <div className="bg-background-light p-4 rounded-lg">
                <p className="font-semibold text-primary">{order.shipping.name}</p>
                <p className="text-slate-600">{order.shipping.address}</p>
                <p className="text-slate-600">
                  {order.shipping.city}, {order.shipping.zipCode}
                </p>
                <p className="text-slate-600">{order.shipping.country}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-6">Resumen de Orden</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="text-success font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Impuestos</span>
                  <span>${(order.total * 0.21).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-lg pb-6 border-b border-slate-200">
                <span className="text-primary">Total</span>
                <span className="text-2xl text-primary">
                  ${(order.total * 1.21).toFixed(2)}
                </span>
              </div>

              <Link
                href="/products"
                className="w-full mt-6 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <MaterialIcon name="shopping_bag" />
                Continuar Comprando
              </Link>
            </div>

            {/* Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">¿Necesitas ayuda?</h4>
              <p className="text-sm text-blue-800 mb-4">
                Si tienes preguntas sobre tu orden, contáctanos.
              </p>
              <button className="w-full px-4 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors text-sm">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
