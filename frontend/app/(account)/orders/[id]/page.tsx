'use client';

import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const statusConfig = {
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: 'hourglass_top' },
  shipped: { label: 'Enviado', color: 'bg-amber-100 text-amber-800', icon: 'local_shipping' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: 'check_circle' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: 'cancel' },
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = {
    id: params.id,
    date: '17 de Febrero de 2024',
    status: 'delivered' as keyof typeof statusConfig,
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

  const tax = order.total * 0.08;
  const totalWithTax = order.total + tax;
  const statusInfo = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20 md:pb-12">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MaterialIcon name="receipt_long" className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Orden #{order.id}</h1>
              <p className="text-slate-600 text-sm">{order.date}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${statusInfo.color}`}>
            <MaterialIcon name={statusInfo.icon} className="text-lg" />
            {statusInfo.label}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="shopping_bag" className="text-primary" />
                Artículos de la Orden
              </h3>
              <div className="divide-y divide-slate-200">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 hover:bg-slate-50/50 px-4 -mx-4 transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Link href={`/products/${item.id}`} className="font-semibold text-primary hover:text-primary/80 transition-colors block mb-2">
                        {item.name}
                      </Link>
                      <div className="flex gap-4 text-sm text-slate-600 mb-3">
                        <span>Cantidad: <span className="font-semibold text-primary">{item.quantity}</span></span>
                        <span>Precio: <span className="font-semibold text-primary">${item.price.toFixed(2)}</span></span>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-2">
                <MaterialIcon name="timeline" className="text-primary" />
                Historial de Seguimiento
              </h3>
              <div className="space-y-0">
                {order.timeline.map((step, idx) => (
                  <div key={idx}>
                    <div className="flex gap-6">
                      {/* Timeline dot and line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white relative z-10 ${step.completed ? 'bg-success' : 'bg-slate-300'}`}>
                          {step.completed ? (
                            <MaterialIcon name="check" className="text-lg" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        {idx < order.timeline.length - 1 && (
                          <div className={`w-1 h-12 ${step.completed ? 'bg-success' : 'bg-slate-300'}`} />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`pb-8 ${idx === order.timeline.length - 1 ? 'pb-0' : ''}`}>
                        <p className="font-semibold text-primary text-lg">{step.status}</p>
                        <p className="text-sm text-slate-600 mt-1">{step.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="location_on" className="text-primary" />
                Dirección de Envío
              </h3>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-5">
                <div className="space-y-2">
                  <p className="font-semibold text-primary text-lg">{order.shipping.name}</p>
                  <div className="text-slate-700 space-y-1">
                    <p>{order.shipping.address}</p>
                    <p>{order.shipping.city}, {order.shipping.zipCode}</p>
                    <p>{order.shipping.country}</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2.5 border-2 border-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <MaterialIcon name="edit" className="text-lg" />
                Cambiar Dirección
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 h-fit">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="receipt" className="text-primary" />
                Resumen de Orden
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="font-semibold text-success">Gratis</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Impuestos (8%)</span>
                  <span className="font-semibold text-primary">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalWithTax.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/products"
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-3"
              >
                <MaterialIcon name="shopping_catalog" className="fill-1" />
                Continuar Comprando
              </Link>

              <button className="w-full px-4 py-2.5 border-2 border-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <MaterialIcon name="file_download" className="text-lg" />
                Descargar Factura
              </button>
            </div>

            {/* Support Widget */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MaterialIcon name="headset_mic" className="text-primary text-lg" />
                </div>
                <h4 className="font-bold text-primary">Centro de Ayuda</h4>
              </div>
              <p className="text-sm text-slate-700 mb-4">
                ¿Tienes preguntas sobre tu orden? Nuestro equipo de soporte está aquí para ayudarte.
              </p>
              <div className="space-y-2">
                <button className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:shadow-md transition-all text-sm flex items-center justify-center gap-2">
                  <MaterialIcon name="chat" className="text-lg" />
                  Chatear
                </button>
                <button className="w-full px-4 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors text-sm flex items-center justify-center gap-2">
                  <MaterialIcon name="info" className="text-lg" />
                  Ver FAQ
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="verified" className="text-success text-xl" />
                  <span className="text-sm text-slate-700"><span className="font-semibold text-primary">Entrega Segura</span><br /><span className="text-xs text-slate-500">Rastreo en tiempo real</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon name="security" className="text-primary text-xl" />
                  <span className="text-sm text-slate-700"><span className="font-semibold text-primary">Compra Protegida</span><br /><span className="text-xs text-slate-500">Garantía de protección</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon name="loop" className="text-primary text-xl" />
                  <span className="text-sm text-slate-700"><span className="font-semibold text-primary">F\u00e1cil Devolución</span><br /><span className="text-xs text-slate-500">30 días sin preguntas</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
