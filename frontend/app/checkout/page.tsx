'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ShippingForm, type ShippingData } from '@/components/checkout/ShippingForm';
import { WompiPaymentStep } from '@/components/checkout/WompiPaymentStep';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/useToast';
import { useWompiCheckout } from '@/hooks/useWompiCheckout';
import apiClient from '@/lib/api-client';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import { formatCOP } from '@/lib/format';
import { useAuthStore } from '@/store/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [showShippingMethod, setShowShippingMethod] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const { items, getTotalPrice } = useCart();
  const { create } = useOrders();
  const { toast } = useToast();
  const { openCheckout } = useWompiCheckout();
  const logout = useAuthStore((s) => s.logout);

  // If no items, redirect to cart
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const steps = ['shipping', 'payment', 'review'];
  const stepLabels = { shipping: 'Envío', payment: 'Método de pago', review: 'Revisión' };
  const stepIcons = { shipping: 'local_shipping', payment: 'account_balance_wallet', review: 'receipt_long' };

  const handleShippingNext = (data: ShippingData) => {
    setShippingData(data);
    setShowShippingMethod(true);
  };

  const handleContinueToPayment = () => {
    setCurrentStep(1);
  };

  const handlePaymentNext = () => {
    setCurrentStep(2);
  };

  const handlePagarConWompi = async () => {
    if (!shippingData) return;

    setIsCreatingOrder(true);
    try {
      // 1. Crear la orden en la BD (status: PENDING) — el total lo calcula el servidor
      const order = await create({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
          address: shippingData.street,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
          country: shippingData.country || 'Colombia',
        },
        shippingMethod,
        shippingCost,
        discount: promoDiscount,
      });

      // 2. Abrir el widget de Wompi con el orderId y los datos del cliente
      await openCheckout({
        orderId: order.id,
        customerEmail: shippingData.email,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
      });

      // El widget abrió correctamente — desbloquear el botón
      setIsCreatingOrder(false);

    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const backendMsg =
        axiosError?.response?.data?.error ||
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        'Error al iniciar el pago';

      // Sesión desactualizada (re-seed de BD) → cerrar sesión automáticamente
      if (backendMsg.includes('sesión está desactualizada')) {
        toast({ message: 'Tu sesión expiró. Cerrando sesión...', type: 'error' });
        setTimeout(() => {
          logout();
          document.cookie = 'auth-token=; path=/; max-age=0; samesite=lax';
          localStorage.removeItem('auth-store');
          router.push('/');
        }, 1500);
        return;
      }

      // Si el producto no existe en la BD, el carrito está desactualizado
      const message = backendMsg.includes('no encontrado')
        ? 'Uno o más productos del carrito ya no están disponibles. Por favor vacía el carrito y agrégalos de nuevo.'
        : backendMsg;

      toast({ message, type: 'error' });
      setIsCreatingOrder(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await apiClient.get(`/coupons?code=${encodeURIComponent(promoCode.trim())}`);
      const coupons: Array<{ code: string; type: string; value: number; isActive: boolean; expiresAt?: string; minOrderAmount?: number }> = res.data?.data ?? res.data ?? [];
      const coupon = Array.isArray(coupons)
        ? coupons.find((c) => c.code.toLowerCase() === promoCode.trim().toLowerCase() && c.isActive)
        : null;

      if (!coupon) throw new Error('invalid');

      // Check expiry
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error('expired');
      // Check min order
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) throw new Error('min_order');

      const discount = coupon.type === 'percentage'
        ? subtotal * (coupon.value / 100)
        : Math.min(coupon.value, subtotal);

      setPromoDiscount(discount);
      setPromoApplied(coupon.code);
      toast({ message: `Código "${coupon.code}" aplicado! -${formatCOP(discount)}`, type: 'success' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'expired') toast({ message: 'Este código promocional ha expirado', type: 'error' });
      else if (msg === 'min_order') toast({ message: 'El total del pedido es muy bajo para este código', type: 'error' });
      else toast({ message: 'Código promocional inválido o no disponible', type: 'error' });
      setPromoDiscount(0);
      setPromoApplied('');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied('');
  };

  const subtotal = getTotalPrice();
  const shippingCost = shippingMethod === 'express' ? 15000 : 0;
  const tax = subtotal * 0.19;
  const total = subtotal + shippingCost + tax - promoDiscount;

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
              {currentStep === 0 && !showShippingMethod && (
                <div className="bg-white rounded-xl border border-primary/10 p-6 md:p-8">
                  <div className="flex items-center gap-4 spacing-header">
                    <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                      1
                    </div>
                    <h2 className="text-xl font-extrabold text-primary">Dirección de Envío</h2>
                  </div>
                  <ShippingForm
                    onNext={handleShippingNext}
                    initialData={shippingData || undefined}
                    submitLabel="Confirmar dirección"
                  />
                </div>
              )}

              {currentStep === 0 && showShippingMethod && (
                <div className="space-y-4">
                  {/* Address summary */}
                  <div className="bg-white rounded-xl border border-primary/10 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                          <MaterialIcon name="check" className="text-base" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-primary">Dirección confirmada</p>
                          {shippingData && (
                            <p className="text-xs text-primary/50 mt-0.5">
                              {shippingData.firstName} {shippingData.lastName} · {shippingData.street}, {shippingData.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowShippingMethod(false)}
                        className="text-xs text-primary/60 hover:text-primary font-semibold transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>

                  {/* Shipping method */}
                  <div className="bg-white rounded-xl border border-primary/10 p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                        2
                      </div>
                      <h2 className="text-xl font-extrabold text-primary">Método de Envío</h2>
                    </div>

                    <div className="space-y-3 mb-8">
                      <button
                        type="button"
                        onClick={() => setShippingMethod('standard')}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          shippingMethod === 'standard'
                            ? 'border-primary bg-primary/5'
                            : 'border-primary/10 hover:border-primary/30'
                        }`}
                      >
                        <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          shippingMethod === 'standard' ? 'border-primary' : 'border-primary/20'
                        }`}>
                          {shippingMethod === 'standard' && <div className="size-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-primary text-sm">Envío Estándar</p>
                            <span className="text-sm font-extrabold text-green-600">GRATIS</span>
                          </div>
                          <p className="text-xs text-primary/50 mt-0.5">5–7 días hábiles</p>
                        </div>
                        <MaterialIcon name="local_shipping" className="text-primary/40 text-xl" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShippingMethod('express')}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          shippingMethod === 'express'
                            ? 'border-primary bg-primary/5'
                            : 'border-primary/10 hover:border-primary/30'
                        }`}
                      >
                        <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          shippingMethod === 'express' ? 'border-primary' : 'border-primary/20'
                        }`}>
                          {shippingMethod === 'express' && <div className="size-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-primary text-sm">Envío Express</p>
                            <span className="text-sm font-extrabold text-primary">$ 15.000</span>
                          </div>
                          <p className="text-xs text-primary/50 mt-0.5">2–3 días hábiles</p>
                        </div>
                        <MaterialIcon name="bolt" className="text-primary/40 text-xl" />
                      </button>
                    </div>

                    <button
                      onClick={handleContinueToPayment}
                      className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base"
                    >
                      Continuar al Pago
                      <MaterialIcon name="arrow_forward" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="bg-white rounded-xl border border-primary/10 p-6 md:p-8">
                  <div className="flex items-center gap-4 spacing-header">
                    <div className="size-10 bg-primary text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                      2
                    </div>
                    <h2 className="text-xl font-extrabold text-primary">Método de Pago</h2>
                  </div>
                  <WompiPaymentStep onNext={handlePaymentNext} />
                  <div className="pt-6 mt-6 border-t border-primary/10">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="flex items-center gap-2 text-primary font-semibold hover:text-primary/70 transition-colors text-sm"
                    >
                      <MaterialIcon name="arrow_back" className="text-base" />
                      Volver al Envío
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
                    <h2 className="text-xl font-extrabold text-primary">Revisar Pedido</h2>
                  </div>

                  {shippingData && (
                    <div className="bg-primary/5 p-5 rounded-xl spacing-header border border-primary/10">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-primary flex items-center gap-2">
                          <MaterialIcon name="local_shipping" className="text-base" />
                          Envío
                        </p>
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="text-xs text-primary/60 hover:text-primary font-semibold"
                        >
                          Editar
                        </button>
                      </div>
                      <p className="font-bold text-primary">{shippingData.firstName} {shippingData.lastName}</p>
                      <p className="text-sm text-primary/60">{shippingData.street}</p>
                      <p className="text-sm text-primary/60">{shippingData.city}, {shippingData.zipCode}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-primary/10">
                        <MaterialIcon name={shippingMethod === 'express' ? 'bolt' : 'local_shipping'} className="text-primary/60 text-sm" />
                        <span className="text-xs text-primary/60">
                          {shippingMethod === 'standard' ? 'Estándar (5–7 días) — Gratis' : 'Express (2–3 días) — $ 15.000'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-primary/5 p-5 rounded-xl spacing-header border border-primary/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-primary flex items-center gap-2">
                        <MaterialIcon name="credit_card" className="text-base" />
                        Método de Pago
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-primary/60 hover:text-primary font-semibold"
                      >
                        Editar
                      </button>
                    </div>
                    <p className="font-bold text-primary">
                      Wompi — Tarjeta · PSE · Nequi · Daviplata
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 text-primary font-semibold hover:text-primary/70 transition-colors text-sm"
                    >
                      <MaterialIcon name="arrow_back" className="text-base" />
                      Volver
                    </button>
                    <button
                      onClick={handlePagarConWompi}
                      disabled={isCreatingOrder}
                      className="sm:ml-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                    >
                      {isCreatingOrder ? (
                        <>
                          <MaterialIcon name="hourglass_bottom" className="animate-spin" />
                          Preparando pago...
                        </>
                      ) : (
                        <>
                          <MaterialIcon name="account_balance_wallet" />
                          Pagar con Wompi
                        </>
                      )}
                    </button>
                  </div>
                  {/* Métodos de pago aceptados */}
                  <p className="text-center text-xs text-primary/40 mt-4">
                    Tarjeta · PSE · Nequi · Daviplata · Bancolombia — procesado por Wompi
                  </p>
                  {/* Aviso si el modal no abre (cuenta en revisión) */}
                  <p className="text-center text-xs text-primary/30 mt-2">
                    Si la ventana de pago no aparece, es posible que la cuenta de Wompi aún esté en proceso de activación.
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: 'lock', label: 'SSL Seguro', desc: 'Checkout encriptado' },
                  { icon: 'assignment_return', label: 'Devoluciones 30 días', desc: 'Devoluciones fáciles' },
                  { icon: 'local_shipping', label: 'Envío Rápido', desc: '2-3 días hábiles' },
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
                <h3 className="text-lg font-extrabold text-primary spacing-header">Resumen del Pedido</h3>

                <div className="space-y-4 spacing-header pb-6 border-b border-primary/10 max-h-72 overflow-y-auto pt-2 px-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 bg-primary/5 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `https://placehold.co/64x64/f1f5f9/94a3b8?text=${encodeURIComponent(item.name.charAt(0))}`;
                            }}
                          />
                        </div>
                        <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary leading-tight">{item.name}</p>
                        <p className="text-sm font-extrabold text-primary mt-1">
                          {formatCOP(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="spacing-header">
                  {promoApplied ? (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MaterialIcon name="local_offer" className="text-green-600 text-base" />
                        <span className="text-sm font-bold text-green-700">{promoApplied} aplicado</span>
                        <span className="text-sm text-green-600">-{formatCOP(promoDiscount)}</span>
                      </div>
                      <button onClick={removePromo} className="text-green-600 hover:text-green-800 transition-colors">
                        <MaterialIcon name="close" className="text-base" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="Código promocional"
                        className="flex-1 px-3 py-2 border border-primary/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 border border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {promoLoading && <MaterialIcon name="sync" className="text-sm animate-spin" />}
                        Aplicar
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-primary/60">
                    <span>Subtotal</span>
                    <span>{formatCOP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>Envío</span>
                    {shippingMethod === 'standard' ? (
                      <span className="text-green-600 font-semibold">Gratis</span>
                    ) : (
                      <span>{formatCOP(shippingCost)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>IVA (19%)</span>
                    <span>{formatCOP(tax)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Descuento ({promoApplied})</span>
                      <span>-{formatCOP(promoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-primary pt-3 border-t border-primary/10 text-base">
                    <span>Total</span>
                    <span>{formatCOP(total)}</span>
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
