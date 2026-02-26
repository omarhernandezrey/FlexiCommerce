'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/lib/api.service';

const statusConfig = {
  pending:   { label: 'Processing', color: 'bg-blue-100 text-blue-800',   icon: 'hourglass_top' },
  confirmed: { label: 'Confirmed',  color: 'bg-indigo-100 text-indigo-800', icon: 'check_circle' },
  shipped:   { label: 'Shipped',    color: 'bg-amber-100 text-amber-800',  icon: 'local_shipping' },
  delivered: { label: 'Delivered',  color: 'bg-green-100 text-green-800',  icon: 'check_circle' },
  cancelled: { label: 'Cancelled',  color: 'bg-gray-100 text-gray-800',    icon: 'cancel' },
};

// Generate timeline steps based on current order status
function getTimeline(order: Order) {
  const steps = [
    { status: 'Order Confirmed',  key: 'pending' },
    { status: 'Processing',       key: 'confirmed' },
    { status: 'Shipped',          key: 'shipped' },
    { status: 'Delivered',        key: 'delivered' },
  ];
  const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.status);
  const date = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  return steps.map((s, idx) => ({ ...s, date, completed: idx <= currentIdx }));
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { currentOrder, loading, error, fetchById } = useOrders();

  const handleDownloadInvoice = () => {
    if (!currentOrder) return;
    const lines = [
      `INVOICE — FlexiCommerce`,
      `Order ID: ${currentOrder.id}`,
      `Date: ${new Date(currentOrder.createdAt).toLocaleDateString()}`,
      `Status: ${currentOrder.status}`,
      ``,
      `ITEMS:`,
      ...currentOrder.items.map((item) => `  Product ${item.productId} — Qty: ${item.quantity} — $${item.price.toFixed(2)}`),
      ``,
      `TOTAL: $${currentOrder.total.toFixed(2)}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${currentOrder.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchById(params.id).catch(() => {/* backend not available */});
  }, [params.id, fetchById]);

  // Skeleton while loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
          <div className="h-4 bg-primary/10 rounded w-64 animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-primary/10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-primary/10 rounded w-64" />
                  <div className="h-4 bg-primary/5 rounded w-32" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-48" />
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse h-32" />
          </div>
        </div>
      </div>
    );
  }

  // Error / not found state
  if (error || !currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-16">
          <MaterialIcon name="receipt_long" className="text-primary/20 text-6xl mb-4" />
          <p className="text-primary font-bold text-xl mb-2">Order not found</p>
          <p className="text-primary/50 text-sm mb-6">We couldn&apos;t find order #{params.id}</p>
          <Link href="/orders" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            <MaterialIcon name="arrow_back" className="text-base" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = currentOrder;
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending;
  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = itemsSubtotal * 0.08;
  const totalWithTax = itemsSubtotal + tax;
  const timeline = getTimeline(order);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const shippingName = order.shippingAddress
    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim()
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Orders', href: '/orders' },
            { label: order.id },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20 md:pb-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MaterialIcon name="receipt_long" className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-primary mb-1">Order #{order.id}</h1>
              <p className="text-slate-600 text-sm">{formattedDate}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 w-fit ${statusInfo.color}`}>
            <MaterialIcon name={statusInfo.icon} className="text-lg" />
            {statusInfo.label}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="shopping_bag" className="text-primary" />
                Order Items
              </h3>
              <div className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="size-16 sm:size-20 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MaterialIcon name="inventory_2" className="text-primary/40 text-2xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary mb-1">Product #{item.productId.slice(0, 8)}</p>
                      <div className="flex gap-4 text-sm text-slate-600 mb-1">
                        <span>Qty: <span className="font-semibold text-primary">{item.quantity}</span></span>
                        <span>Price: <span className="font-semibold text-primary">${item.price.toFixed(2)}</span></span>
                      </div>
                      <p className="text-base font-bold text-primary">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-8 flex items-center gap-2">
                <MaterialIcon name="timeline" className="text-primary" />
                Order Tracking
              </h3>
              <div className="space-y-0">
                {timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white relative z-10 ${step.completed ? 'bg-green-500' : 'bg-slate-200'}`}>
                        {step.completed
                          ? <MaterialIcon name="check" className="text-lg" />
                          : <span className="text-slate-400 text-sm">{idx + 1}</span>
                        }
                      </div>
                      {idx < timeline.length - 1 && (
                        <div className={`w-0.5 h-10 ${step.completed ? 'bg-green-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className={`pb-8 ${idx === timeline.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`font-semibold text-base ${step.completed ? 'text-primary' : 'text-slate-400'}`}>{step.status}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            {order.shippingAddress && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <MaterialIcon name="location_on" className="text-primary" />
                  Shipping Address
                </h3>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-5">
                  <p className="font-semibold text-primary text-lg mb-1">{shippingName}</p>
                  <div className="text-slate-700 space-y-0.5 text-sm">
                    <p>{order.shippingAddress.address}</p>
                    {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                    {order.shippingAddress.email && <p>{order.shippingAddress.email}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 h-fit">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <MaterialIcon name="receipt" className="text-primary" />
                Order Summary
              </h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-primary">${itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-primary">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total</span>
                <span className="text-2xl font-bold text-primary">${totalWithTax.toFixed(2)}</span>
              </div>

              <Link
                href="/products"
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3 text-sm"
              >
                <MaterialIcon name="storefront" className="text-base" />
                Continue Shopping
              </Link>

              <button
                onClick={handleDownloadInvoice}
                className="w-full px-4 py-2.5 border-2 border-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <MaterialIcon name="file_download" className="text-lg" />
                Download Invoice
              </button>
            </div>

            {/* Support Widget */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="headset_mic" className="text-primary text-lg" />
                </div>
                <h4 className="font-bold text-primary">Need Help?</h4>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Questions about your order? Our support team is here 24/7.
              </p>
              <div className="space-y-2">
                <a
                  href={`mailto:support@flexicommerce.com?subject=Order%20${currentOrder?.id}`}
                  className="w-full px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:shadow-md transition-all text-sm flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="chat" className="text-base" />
                  Chat with Support
                </a>
                <a
                  href="mailto:support@flexicommerce.com"
                  className="w-full px-4 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="help_outline" className="text-base" />
                  Visit Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
