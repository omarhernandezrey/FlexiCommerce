'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ShippingForm, type ShippingData } from '@/components/checkout/ShippingForm';
import { PaymentForm, type PaymentMethod } from '@/components/checkout/PaymentForm';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/useToast';
import { ProtectedRoute } from '@/components/auth/AuthProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  const { items, getTotalPrice } = useCart();
  const { create } = useOrders();
  const { toast } = useToast();

  // If no items, redirect to cart
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const steps = ['shipping', 'payment', 'review'];
  const stepLabels = { shipping: 'Envío', payment: 'Pago', review: 'Revisión' };

  const handleShippingNext = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStep(1);
  };

  const handlePaymentNext = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCurrentStep(2);
  };

  const handleCreateOrder = async () => {
    if (!shippingData) return;

    setIsCreatingOrder(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getTotalPrice(),
        status: 'pending' as const,
        userId: '', // Se establece desde el backend
        createdAt: new Date().toISOString(),
      };

      const order = await create(orderData);
      
      toast({
        message: 'Orden creada exitosamente',
        type: 'success',
      });

      // Redirect to confirmation
      router.push(`/checkout/confirmation?orderId=${order.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear la orden';
      toast({
        message,
        type: 'error',
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="pb-20 md:pb-0">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
          <Breadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Carrito', href: '/cart' },
              { label: 'Checkout' },
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress */}
          <div className="flex justify-between mb-12">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <button
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    idx <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </button>
                <div className="flex-1 ml-4">
                  <p className="text-sm font-semibold text-primary">{stepLabels[steps[idx] as keyof typeof stepLabels]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-8">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-primary">Información de Envío</h2>
                  <ShippingForm 
                    onNext={handleShippingNext}
                    initialData={shippingData || undefined}
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-primary">Método de Pago</h2>
                  <PaymentForm onNext={handlePaymentNext} />
                  <div className="pt-4">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="px-6 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      Atrás
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-primary">Revisión de Orden</h2>

                  {shippingData && (
                    <div className="bg-background-light p-6 rounded-lg">
                      <p className="text-sm text-slate-600 mb-4">Dirección de Envío</p>
                      <p className="font-semibold text-primary">{shippingData.firstName} {shippingData.lastName}</p>
                      <p className="text-sm text-slate-600">{shippingData.street}</p>
                      <p className="text-sm text-slate-600">{shippingData.city}, {shippingData.zipCode}</p>
                      <p className="text-xs text-slate-500 mt-2">Email: {shippingData.email}</p>
                      <p className="text-xs text-slate-500">Teléfono: {shippingData.phone}</p>
                    </div>
                  )}

                  <div className="bg-background-light p-6 rounded-lg">
                    <p className="text-sm text-slate-600 mb-4">Método de Pago</p>
                    <p className="font-semibold text-primary capitalize">
                      {paymentMethod === 'card' && 'Tarjeta de Crédito/Débito'}
                      {paymentMethod === 'paypal' && 'PayPal'}
                      {paymentMethod === 'transfer' && 'Transferencia Bancaria'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleCreateOrder}
                      disabled={isCreatingOrder}
                      className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCreatingOrder && <MaterialIcon name="hourglass_bottom" />}
                      {isCreatingOrder ? 'Procesando...' : 'Confirmar Orden'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-primary mb-6">Resumen de Orden</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">{item.name}</p>
                        <p className="text-xs text-slate-600">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary pt-3 border-t border-slate-200 text-base">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
