'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState('shipping');

  const steps = ['shipping', 'payment', 'review'];
  const stepLabels = { shipping: 'Envío', payment: 'Pago', review: 'Revisión' };

  return (
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
                onClick={() => idx <= steps.indexOf(currentStep) && setCurrentStep(step)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  steps.indexOf(step) <= steps.indexOf(currentStep)
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {idx + 1}
              </button>
              <div className="flex-1 ml-4">
                <p className="text-sm font-semibold text-primary">{stepLabels[step as keyof typeof stepLabels]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-8">
            {currentStep === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Información de Envío</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Apellido</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Dirección</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Ciudad</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Código Postal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep('payment')}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Continuar al Pago
                </button>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Método de Pago</h2>

                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-primary rounded-lg cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="mr-3" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary">Tarjeta de Crédito</p>
                      <p className="text-sm text-slate-600">Visa, Mastercard, Amex</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-slate-200 rounded-lg cursor-pointer">
                    <input type="radio" name="payment" className="mr-3" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary">PayPal</p>
                      <p className="text-sm text-slate-600">Pago seguro con PayPal</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-slate-200 rounded-lg cursor-pointer">
                    <input type="radio" name="payment" className="mr-3" />
                    <div className="flex-1">
                      <p className="font-semibold text-primary">Transferencia Bancaria</p>
                      <p className="text-sm text-slate-600">Ingresa los detalles de tu banco</p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="px-6 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => setCurrentStep('review')}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary">Revisión de Orden</h2>

                <div className="bg-background-light p-6 rounded-lg">
                  <p className="text-sm text-slate-600 mb-4">Dirección de Envío</p>
                  <p className="font-semibold text-primary">Juan Pérez</p>
                  <p className="text-sm text-slate-600">Calle Principal 123</p>
                  <p className="text-sm text-slate-600">Ciudad, 12345</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-primary">$299.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Envío</span>
                    <span className="font-semibold text-primary">Gratis</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <span className="font-semibold text-primary">Total</span>
                    <span className="text-2xl font-bold text-primary">$299.00</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="px-6 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Atrás
                  </button>
                  <Link href="/checkout/confirmation" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
                    Confirmar Orden
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-primary mb-6">Resumen de Orden</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">Producto Nombre</p>
                    <p className="text-xs text-slate-600">Cantidad: 1</p>
                    <p className="text-sm font-bold text-primary mt-1">$299.00</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>$299.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between font-bold text-primary pt-3 border-t border-slate-200 text-base">
                  <span>Total</span>
                  <span>$299.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
