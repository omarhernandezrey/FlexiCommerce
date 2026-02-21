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
          <h1 className="text-2xl font-extrabold text-primary mb-3">Order not found</h1>
          <p className="text-primary/60 mb-8">We couldn&apos;t find the requested order.</p>
          <Link href="/" className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors text-center">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = currentOrder.total;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-background-light relative overflow-hidden">
      {/* Decorative confetti elements */}
      <div className="absolute top-20 left-10 size-4 bg-yellow-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-32 left-24 size-3 bg-blue-400 rounded-sm opacity-60 rotate-45 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute top-16 right-16 size-5 bg-red-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute top-40 right-32 size-3 bg-green-400 rounded-sm opacity-60 rotate-12 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="absolute top-24 left-1/3 size-2 bg-purple-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute top-56 right-1/4 size-4 bg-orange-400 rounded-sm opacity-60 rotate-45 animate-bounce" style={{ animationDelay: '0.5s' }}></div>

      <div className="max-w-2xl mx-auto px-4 py-16 relative z-10">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-24 bg-primary rounded-full mb-6 shadow-2xl shadow-primary/20">
            <MaterialIcon name="check" className="text-white !text-5xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-primary mb-3">
            Thank You for Your Purchase!
          </h1>
          <p className="text-primary/60 mb-2">
            Your order <span className="font-bold text-primary">#{currentOrder.id.substring(0, 8).toUpperCase()}</span> has been confirmed.
          </p>
          <p className="text-sm text-primary/40">
            A confirmation email has been sent to your inbox.
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
          {/* Delivery Banner */}
          <div className="bg-primary/5 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MaterialIcon name="local_shipping" className="text-primary" />
              <div>
                <p className="text-xs text-primary/60 font-medium">Estimated Delivery</p>
                <p className="font-bold text-primary text-sm">Thursday, within 3-5 business days</p>
              </div>
            </div>
            <button className="text-sm font-bold text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors">
              Track Order
            </button>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-primary/10">
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Order ID</p>
                <p className="font-bold text-primary text-sm">#{currentOrder.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Date</p>
                <p className="font-bold text-primary text-sm">
                  {new Date(currentOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Status</p>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold capitalize">
                  {currentOrder.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-primary/40 mb-1 font-medium uppercase tracking-wider">Total</p>
                <p className="font-extrabold text-primary">${total.toFixed(2)}</p>
              </div>
            </div>

            {/* Order Items */}
            {currentOrder.items && currentOrder.items.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Order Items</h3>
                <div className="space-y-3">
                  {currentOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-primary/5 last:border-0">
                      <div>
                        <p className="font-bold text-primary text-sm">{item.productName}</p>
                        <p className="text-xs text-primary/40">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 text-sm pb-6 mb-6 border-b border-primary/10">
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
              <div className="flex justify-between font-extrabold text-primary text-base pt-2 border-t border-primary/10 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/orders" className="flex-1">
                <button className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-bold">
                  View My Orders
                </button>
              </Link>
              <Link href="/" className="flex-1">
                <button className="w-full border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors font-bold">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: 'lock', label: 'Secure Payment', desc: 'Your data is safe' },
            { icon: 'assignment_return', label: 'Easy Returns', desc: '30 days guarantee' },
            { icon: 'support_agent', label: '24/7 Support', desc: 'Always here for you' },
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
