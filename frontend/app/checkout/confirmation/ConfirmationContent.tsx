'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';
import { formatCOP } from '@/lib/format';

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const { currentOrder, fetchById } = useOrders();
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        await fetchById(orderId);
        clearCart();
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, fetchById, clearCart, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-primary/10 p-8 text-center max-w-md w-full">
          <MaterialIcon name="error" className="text-5xl text-red-500 mb-4 text-center block" />
          <h1 className="text-2xl font-extrabold text-primary mb-3">Orden no encontrada</h1>
          <p className="text-primary/60 mb-8">No pudimos encontrar los detalles de tu orden.</p>
          <Link href="/" className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors text-center">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  // El total de la BD ya incluye IVA (19%) + envío. Derivamos el desglose:
  const itemsTotal = (currentOrder.items ?? []).reduce(
    (sum: number, item: any) => sum + Number(item.price) * item.quantity,
    0,
  );
  const shippingCost = Number((currentOrder as any).shippingCost) || 0;
  const tax = itemsTotal * 0.19;
  const total = Number(currentOrder.total); // viene de la BD, ya calculado correctamente

  const fechaOrden = new Date(currentOrder.createdAt).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING:    { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
    PROCESSING: { label: 'En proceso',  color: 'bg-blue-100 text-blue-700' },
    SHIPPED:    { label: 'Enviado',     color: 'bg-indigo-100 text-indigo-700' },
    DELIVERED:  { label: 'Entregado',   color: 'bg-green-100 text-green-700' },
    CANCELLED:  { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
  };
  const statusInfo = statusLabels[currentOrder.status?.toUpperCase()] ?? {
    label: currentOrder.status,
    color: 'bg-primary/10 text-primary/60',
  };

  return (
    <div className="min-h-screen bg-background-light relative overflow-hidden">
      {/* Confetti decorativo */}
      <div className="absolute top-20 left-10 size-4 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-32 left-24 size-3 bg-blue-400 rounded-sm opacity-60 rotate-45 animate-bounce" style={{ animationDelay: '0.2s' }} />
      <div className="absolute top-16 right-16 size-5 bg-red-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.4s' }} />
      <div className="absolute top-40 right-32 size-3 bg-green-400 rounded-sm opacity-60 rotate-12 animate-bounce" style={{ animationDelay: '0.1s' }} />
      <div className="absolute top-24 left-1/3 size-2 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.3s' }} />
      <div className="absolute top-56 right-1/4 size-4 bg-orange-400 rounded-sm opacity-60 rotate-45 animate-bounce" style={{ animationDelay: '0.5s' }} />

      <div className="max-w-2xl mx-auto px-4 py-16 relative z-10">
        {/* Ícono de éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-24 bg-primary rounded-full mb-6 shadow-2xl shadow-primary/20">
            <MaterialIcon name="check" className="text-white !text-5xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-primary mb-3">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-primary/60 mb-2">
            Tu orden <span className="font-bold text-primary">#{currentOrder.id.substring(0, 8).toUpperCase()}</span> ha sido confirmada.
          </p>
          <p className="text-sm text-primary/40">
            Recibirás un correo de confirmación en tu bandeja de entrada.
          </p>
        </div>

        {/* Tarjeta de orden */}
        <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
          {/* Banner de envío */}
          <div className="bg-primary/5 border-b border-primary/10 px-6 py-4 flex items-center gap-3">
            <MaterialIcon name="local_shipping" className="text-primary" />
            <div>
              <p className="text-xs text-primary/60 font-medium">Tiempo estimado de entrega</p>
              <p className="font-bold text-primary text-sm">
                {shippingCost > 0 ? '2–3 días hábiles (Express)' : '5–7 días hábiles (Estándar)'}
              </p>
            </div>
          </div>

          {/* Detalles de la orden */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-primary/10">
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">N° Orden</p>
                <p className="font-bold text-primary text-sm">#{currentOrder.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Fecha</p>
                <p className="font-bold text-primary text-sm">{fechaOrden}</p>
              </div>
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Estado</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Total</p>
                <p className="font-extrabold text-primary">{formatCOP(total)}</p>
              </div>
            </div>

            {/* Productos */}
            {currentOrder.items && currentOrder.items.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Productos</h3>
                <div className="space-y-3">
                  {currentOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-primary/5 last:border-0">
                      <div>
                        <p className="font-bold text-primary text-sm">
                          {item.product?.name ?? item.productName ?? `Producto ${idx + 1}`}
                        </p>
                        <p className="text-xs text-primary/40">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-primary">{formatCOP(Number(item.price) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desglose de totales */}
            <div className="space-y-2 text-sm pb-6 mb-6 border-b border-primary/10">
              <div className="flex justify-between text-primary/60">
                <span>Subtotal</span>
                <span>{formatCOP(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>Envío</span>
                {shippingCost > 0 ? (
                  <span>{formatCOP(shippingCost)}</span>
                ) : (
                  <span className="text-green-600 font-semibold">Gratis</span>
                )}
              </div>
              <div className="flex justify-between text-primary/60">
                <span>IVA (19%)</span>
                <span>{formatCOP(tax)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-primary text-base pt-2 border-t border-primary/10 mt-2">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/orders" className="flex-1">
                <button className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-bold">
                  Ver mis órdenes
                </button>
              </Link>
              <Link href="/" className="flex-1">
                <button className="w-full border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors font-bold">
                  Seguir comprando
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: 'lock', label: 'Pago Seguro', desc: 'Tus datos están protegidos' },
            { icon: 'assignment_return', label: 'Devoluciones', desc: 'Garantía de 30 días' },
            { icon: 'support_agent', label: 'Soporte 24/7', desc: 'Siempre disponibles' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white rounded-xl border border-primary/10 p-4 text-center"
            >
              <MaterialIcon name={feature.icon} className="text-primary text-2xl mb-2" />
              <p className="text-xs font-bold text-primary">{feature.label}</p>
              <p className="text-[10px] text-primary/40">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
