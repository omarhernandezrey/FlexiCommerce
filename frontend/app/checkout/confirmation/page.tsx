'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';

export default function OrderConfirmationPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Orden no encontrada</h1>
          <Link href="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Confirmación de Orden' },
          ]}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <MaterialIcon name="check_circle" className="text-4xl text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">¡Orden Confirmada!</h1>
          <p className="text-slate-600 text-lg">
            Gracias por tu compra. Tu orden ha sido creada exitosamente.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Detalles de la Orden</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-slate-600 mb-2">Número de Orden</p>
              <p className="text-xl font-bold text-primary">{currentOrder.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Fecha</p>
              <p className="text-xl font-bold text-primary">
                {new Date(currentOrder.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Estado</p>
              <div className="inline-block px-4 py-2 bg-yellow-100 rounded-full">
                <p className="text-sm font-semibold text-yellow-800 capitalize">
                  {currentOrder.status === 'pending' && 'Pendiente'}
                  {currentOrder.status === 'confirmed' && 'Confirmada'}
                  {currentOrder.status === 'shipped' && 'Enviada'}
                  {currentOrder.status === 'delivered' && 'Entregada'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Total</p>
              <p className="text-xl font-bold text-primary">${currentOrder.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-primary mb-4">Productos</h3>
            <div className="space-y-4">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-semibold text-primary">Producto ID: {item.productId}</p>
                    <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Próximos Pasos</h3>
          <ul className="space-y-3 text-sm text-blue-900">
            <li className="flex items-start gap-3">
              <MaterialIcon name="check" className="text-blue-600 mt-0.5" />
              <span>Recibirás un email de confirmación en breve</span>
            </li>
            <li className="flex items-start gap-3">
              <MaterialIcon name="truck" className="text-blue-600 mt-0.5" />
              <span>Tu orden será preparada y enviada en los próximos 2-3 días hábiles</span>
            </li>
            <li className="flex items-start gap-3">
              <MaterialIcon name="info" className="text-blue-600 mt-0.5" />
              <span>Podrás seguir el estado de tu orden en tu cuenta</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/orders"
            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <MaterialIcon name="history" />
            Ver Mis Órdenes
          </Link>
          <Link
            href="/products"
            className="flex-1 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <MaterialIcon name="shopping" />
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
