'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <MaterialIcon name="error" className="text-5xl text-red-500 mb-4 text-center block" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
            <p className="text-gray-600 mb-8">No pudimos encontrar el pedido solicitado.</p>
            <Link href="/">
              <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition">
                Volver al inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-block text-6xl text-green-500 mb-4">
              <MaterialIcon name="check_circle" className="text-6xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Gracias por tu compra!</h1>
            <p className="text-gray-600">Tu pedido ha sido recibido y está siendo procesado</p>
          </div>

          {/* Order details */}
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Número de Pedido</p>
                <p className="text-lg font-semibold text-gray-900">{currentOrder.id.substring(0, 8)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Fecha</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(currentOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentOrder.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-lg font-semibold text-gray-900">${currentOrder.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Artículos del Pedido</h2>
            <div className="space-y-3">
              {currentOrder.items && currentOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping info */}
          {currentOrder.shippingAddress && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Dirección de Envío</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{currentOrder.shippingAddress.firstName} {currentOrder.shippingAddress.lastName}</p>
                <p className="text-gray-600">{currentOrder.shippingAddress.address}</p>
                <p className="text-gray-600">{currentOrder.shippingAddress.email}</p>
                <p className="text-gray-600">{currentOrder.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Próximos pasos:</span> Recibirás un email de confirmación en los próximos minutos. El envío será procesado en 24-48 horas hábiles.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/my-orders" className="flex-1">
              <button className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium">
                Ver Mis Pedidos
              </button>
            </Link>
            <Link href="/" className="flex-1">
              <button className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium">
                Continuar Comprando
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
