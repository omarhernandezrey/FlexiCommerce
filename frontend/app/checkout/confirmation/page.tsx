'use client';

import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="check_circle" className="text-success text-4xl" filled />
          </div>

          <h1 className="text-3xl font-bold text-primary mb-2">¡Orden Confirmada!</h1>
          <p className="text-slate-600 mb-2">Gracias por tu compra</p>
          <p className="text-sm text-slate-500 mb-8">
            Tu orden ha sido procesada exitosamente
          </p>

          {/* Order Details */}
          <div className="bg-background-light rounded-lg p-6 mb-8 text-left space-y-4">
            <div>
              <p className="text-sm text-slate-600">Número de Orden</p>
              <p className="font-bold text-primary">#FCM-2024-001234</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Fecha</p>
              <p className="font-bold text-primary">17 de Febrero de 2024</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="font-bold text-primary">$299.00</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Estado</p>
              <p className="font-bold text-success">En Proceso</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex gap-3">
              <MaterialIcon name="info" className="text-blue-600 flex-shrink-0" />
              <div className="text-left text-sm">
                <p className="font-semibold text-blue-900 mb-1">Recibirás actualizaciones por email</p>
                <p className="text-blue-800">
                  Te enviaremos el número de seguimiento cuando tu orden sea enviada.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/orders"
              className="block w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors text-center"
            >
              Ver Mis Órdenes
            </Link>
            <Link
              href="/products"
              className="block w-full border-2 border-primary text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors text-center"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
