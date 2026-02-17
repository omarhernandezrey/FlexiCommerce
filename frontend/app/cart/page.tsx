'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  return (
    <div className="pb-20 md:pb-0">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Carrito' },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Carrito de Compras</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 flex gap-6"
                >
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.id}`}
                      className="block font-semibold text-primary hover:text-primary/80 mb-2"
                    >
                      {item.name}
                    </Link>
                    {item.color && (
                      <p className="text-sm text-slate-600">Color: {item.color}</p>
                    )}
                    {item.size && (
                      <p className="text-sm text-slate-600">Tamaño: {item.size}</p>
                    )}
                    <p className="text-lg font-bold text-primary mt-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MaterialIcon name="close" className="text-red-500" />
                    </button>

                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="px-3 py-2 hover:bg-slate-50"
                      >
                        <MaterialIcon name="remove" className="text-sm" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-primary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-slate-50"
                      >
                        <MaterialIcon name="add" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 py-4 text-primary font-semibold hover:underline"
              >
                <MaterialIcon name="arrow_back" />
                Continuar Comprando
              </Link>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 h-fit sticky top-24">
              <h3 className="text-xl font-bold text-primary mb-6">Resumen del Carrito</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="text-success font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Impuestos</span>
                  <span>${(getTotalPrice() * 0.21).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200 text-lg">
                <span className="font-bold text-primary">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${(getTotalPrice() * 1.21).toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <MaterialIcon name="payment" />
                Ir al Checkout
              </Link>

              <button
                onClick={() => clearCart()}
                className="w-full px-4 py-2 border-2 border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Limpiar Carrito
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <MaterialIcon name="shopping_bag" className="text-slate-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-2">Tu carrito está vacío</h2>
            <p className="text-slate-600 mb-6">
              Agrega algunos productos para comenzar tu compra
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Explorar Productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
