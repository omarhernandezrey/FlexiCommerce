'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Carrito' },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-12 pb-24 sm:pb-20 md:pb-12">
        {/* Header Section */}
        <div className="spacing-header">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MaterialIcon name="shopping_bag" className="text-primary text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-primary">Carrito de Compras</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">{items.length} artículos en tu carrito</p>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Items List */}
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="card-padding hover:bg-slate-50/50 transition-colors group"
                    >
                      <div className="flex gap-3 sm:gap-4 md:gap-6">
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 sm:w-20 md:w-28 h-16 sm:h-20 md:h-28 rounded-lg object-cover"
                          />
                          <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
                            {item.quantity}x
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${item.id}`}
                              className="block font-semibold text-sm sm:text-base md:text-lg text-primary hover:text-primary/80 transition-colors mb-2 line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3 flex-wrap">
                              {item.color && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500">Color:</span>
                                  <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full border-2 border-slate-300" style={{ backgroundColor: item.color }} />
                                  <span className="hidden sm:inline">{item.color}</span>
                                </div>
                              )}
                              {item.size && (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500">Tamaño:</span>
                                  <span>{item.size}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Control */}
                          <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center bg-primary/5 rounded-lg border border-primary/10">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                }
                                className="px-3 py-2 hover:bg-primary/10 transition-colors"
                              >
                                <MaterialIcon name="remove" className="text-sm text-primary" />
                              </button>
                              <span className="px-4 py-2 font-bold text-primary min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-2 hover:bg-primary/10 transition-colors"
                              >
                                <MaterialIcon name="add" className="text-sm text-primary" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2.5 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                              <MaterialIcon name="delete" className="text-red-500 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="card-padding bg-slate-50/50 border-t border-slate-200">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base hover:text-primary/80 transition-colors"
                  >
                    <MaterialIcon name="arrow_back" className="text-base sm:text-lg" />
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 card-padding sticky top-20 sm:top-24 h-fit">
                <h3 className="text-lg sm:text-xl font-bold text-primary spacing-header flex items-center gap-2">
                  <MaterialIcon name="receipt" className="text-primary text-base sm:text-lg" />
                  Resumen del Pedido
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-200">
                  <div className="flex justify-between text-slate-600 text-sm sm:text-base">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-semibold text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-sm">Envío</span>
                    <span className="font-semibold text-success">Gratis</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-sm">Impuestos (8%)</span>
                    <span className="font-semibold text-primary">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="spacing-header pb-6 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                >
                  <MaterialIcon name="payment" className="fill-1" />
                  Proceder al Pago
                </Link>

                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas vaciar todo el carrito?')) {
                      clearCart();
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Vaciar Carrito
                </button>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 space-y-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MaterialIcon name="security" className="text-success text-lg" />
                    <span>Pago 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MaterialIcon name="local_shipping" className="text-primary text-lg" />
                    <span>Envío gratis en compras</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MaterialIcon name="loop" className="text-primary text-lg" />
                    <span>Devoluciones fáciles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <MaterialIcon name="shopping_bag" className="text-slate-400 text-4xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-primary mb-3">Tu carrito está vacío</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Agrega algunos productos para comenzar tu aventura de compras
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <MaterialIcon name="shopping_catalog" className="fill-1" />
                Explorar Productos
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 font-semibold px-8 py-3 rounded-lg hover:border-slate-400 transition-colors"
              >
                <MaterialIcon name="home" />
                Ir a Inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
