'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id as string;

  const { currentOrder, loading, error, fetchById, updateStatus } = useOrdersAdmin();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchById(orderId);
    }
  }, [orderId, fetchById]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatus(orderId, newStatus as any);
      toast({ message: '✅ Estado actualizado exitosamente', type: 'success' });
    } catch (error) {
      toast({ message: '❌ Error al actualizar estado', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      shipped: 'Enviada',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const statusFlow = ['pending', 'confirmed', 'shipped', 'delivered'];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !currentOrder) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:underline mb-4"
          >
            <MaterialIcon name="arrow_back" />
            Volver
          </button>
          <div className="text-center text-red-600">
            <MaterialIcon name="error" className="text-4xl mx-auto mb-2" />
            <p>{error || 'Orden no encontrada'}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <MaterialIcon name="arrow_back" />
          Volver
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Orden #{currentOrder.id.slice(0, 8)}</h1>
          <p className="text-slate-600">
            Creada el {new Date(currentOrder.createdAt || '').toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4">Estado de la Orden</h2>
          <div className="flex justify-between items-center mb-6">
            {statusFlow.map((status, idx) => (
              <div key={status} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 border-2 ${
                    statusFlow.indexOf(currentOrder.status) >= idx
                      ? 'bg-primary text-white border-primary'
                      : 'bg-slate-100 text-slate-400 border-slate-300'
                  }`}
                >
                  <MaterialIcon
                    name={
                      status === 'pending'
                        ? 'schedule'
                        : status === 'confirmed'
                        ? 'check_circle'
                        : status === 'shipped'
                        ? 'local_shipping'
                        : 'done_all'
                    }
                  />
                </div>
                <p className="text-sm font-semibold text-slate-600 text-center">{getStatusLabel(status)}</p>
                {idx < statusFlow.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-2 ${
                      statusFlow.indexOf(currentOrder.status) > idx ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Status Actions */}
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Cambiar Estado</label>
            <div className="flex gap-2 flex-wrap">
              {['pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentOrder.status === status
                      ? `${getStatusColor(status)} border-2 cursor-default`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Productos de la Orden</h2>
              <div className="space-y-4">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-semibold text-primary">Producto: {item.productId}</p>
                      <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Total */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Resumen</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-slate-600">Subtotal</p>
                  <p className="font-semibold text-primary">${currentOrder.total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-600">Envío</p>
                  <p className="font-semibold text-primary">Gratis</p>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <p className="font-semibold text-slate-700">Total</p>
                  <p className="text-2xl font-bold text-primary">${currentOrder.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">Detalles</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Usuario</p>
                  <p className="font-semibold text-primary">{currentOrder.userId}</p>
                </div>
                <div>
                  <p className="text-slate-600">Método de Pago</p>
                  <p className="font-semibold text-primary">
                    {currentOrder.paymentMethod || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Total de Items</p>
                  <p className="font-semibold text-primary">{currentOrder.items.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
