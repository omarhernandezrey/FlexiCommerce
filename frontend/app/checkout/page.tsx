'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const stepLabels = { shipping: 'Shipping', payment: 'Payment', review: 'Review' };
  const stepIcons = { shipping: 'local_shipping', payment: 'credit_card', review: 'receipt_long' };

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

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <ProtectedRoute>
      <div className="bg-background-light min-h-screen">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-primary/10">
          <div className="container-main py-4">
            <Breadcrumbs
              items={[
                { label: 'Inicio', href: '/' },
                { label: 'Carrito', href: '/cart' },
                { label: 'Checkout' },
              ]}
            />
          </div>
        </div>

        <div className="container-main py-6 sm:py-8 md:py-12">
          {/* Progress Steps */}
          <div className="flex items-center justify-center spacing-header">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => idx <= currentStep && setCurrentStep(idx)}
                    disabled={idx > currentStep}
                    className={`size-10 sm:size-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      idx < currentStep
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-primary/10 text-primary/40'
                    }`}
                  >
                    {idx < currentStep ? (
                      <MaterialIcon name="check" className="text-xl" />
                    ) : (
                      <MaterialIcon name={stepIcons[step as keyof typeof stepIcons]} className="text-xl" />
                    )}
                  </button>
                  <span
                    className={`text-xs font-bold ${
                      idx <= currentStep ? 'text-primary' : 'text-primary/40'
                    }`}
                  >
                    {stepLabels[step as keyof typeof stepLabels]}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-24 mx-2 sm:mx-4 mb-6 rounded-full transition-colors ${
                      idx < currentStep ? 'bg-green-500' : 'bg-primary/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 spacing-section">
              {currentStep === 0 && (
                <div className="bg-white rounded-xl border border-primary/10 p-6 md:p-8">
                  {/* Section Number */}
                  <div className="flex items-center gap-4 spacing-header">
                    <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                      1
                    </div>
                    <h2 className="text-xl font-extrabold text-primary">Shipping Address</h2>
                  </div>
                  <ShippingForm
                    onNext={handleShippingNext}
                    initialData={shippingData || undefined}
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="bg-white rounded-xl border border-primary/10 p-6 md:p-8">
                  <div className="flex items-center gap-4 spacing-header">
                    <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                      2
                    </div>
                    <h2 className="text-xl font-extrabold text-primary">Payment Method</h2>
                  </div>
                  <PaymentForm onNext={handlePaymentNext} />
                  <div className="pt-6 mt-6 border-t border-primary/10">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="flex items-center gap-2 text-primary font-semibold hover:text-primary/70 transition-colors text-sm"
                    >
                      <MaterialIcon name="arrow_back" className="text-base" />
                      Back to Shipping
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-xl border border-primary/10 p-6 md:p-8">
                  <div className="flex items-center gap-4 spacing-header">
                    <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                      3
                    </div>
                    <h2 className="text-xl font-extrabold text-primary">Review Order</h2>
                  </div>

                  {shippingData && (
                    <div className="bg-primary/5 p-5 rounded-xl spacing-header border border-primary/10">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-primary flex items-center gap-2">
                          <MaterialIcon name="local_shipping" className="text-base" />
                          Shipping Address
                        </p>
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="text-xs text-primary/60 hover:text-primary font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="font-bold text-primary">{shippingData.firstName} {shippingData.lastName}</p>
                      <p className="text-sm text-primary/60">{shippingData.street}</p>
                      <p className="text-sm text-primary/60">{shippingData.city}, {shippingData.zipCode}</p>
                    </div>
                  )}

                  <div className="bg-primary/5 p-5 rounded-xl spacing-header border border-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-primary flex items-center gap-2">
                        <MaterialIcon name="credit_card" className="text-base" />
                        Payment Method
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-primary/60 hover:text-primary font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-bold text-primary capitalize">
                      {paymentMethod === 'card' && 'Credit / Debit Card'}
                      {paymentMethod === 'paypal' && 'PayPal'}
                      {paymentMethod === 'transfer' && 'Bank Transfer'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 text-primary font-semibold hover:text-primary/70 transition-colors text-sm"
                    >
                      <MaterialIcon name="arrow_back" className="text-base" />
                      Back to Payment
                    </button>
                    <button
                      onClick={handleCreateOrder}
                      disabled={isCreatingOrder}
                      className="sm:ml-auto px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCreatingOrder && <MaterialIcon name="hourglass_bottom" />}
                      {isCreatingOrder ? 'Processing...' : 'Complete Purchase'}
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: 'lock', label: 'SSL Secure', desc: 'Encrypted checkout' },
                  { icon: 'assignment_return', label: '30-Day Returns', desc: 'Easy returns' },
                  { icon: 'local_shipping', label: 'Fast Shipping', desc: '2-3 business days' },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="bg-white rounded-xl border border-primary/10 p-4 flex flex-col items-center text-center gap-2"
                  >
                    <MaterialIcon name={badge.icon} className="text-primary text-2xl" />
                    <p className="text-xs font-bold text-primary">{badge.label}</p>
                    <p className="text-[10px] text-primary/40">{badge.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-primary/10 p-6 sticky top-24">
                <h3 className="text-lg font-extrabold text-primary spacing-header">Order Summary</h3>

                <div className="space-y-4 spacing-header pb-6 border-b border-primary/10 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-primary/5 rounded-lg flex-shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary leading-tight">{item.name}</p>
                        <p className="text-sm font-extrabold text-primary mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="flex gap-2 spacing-header">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button className="px-4 py-2 border border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary/5 transition-colors">
                    Apply
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-primary/60">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-primary pt-3 border-t border-primary/10 text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
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
