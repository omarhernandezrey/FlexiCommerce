'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProductCard } from '@/components/products/ProductCard';
import { MOCK_PRODUCTS } from '@/lib/constants';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(MOCK_PRODUCTS.slice(0, 4));

  const removeFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(p => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary">Mi Wishlist</h1>
        <span className="bg-primary text-white px-4 py-2 rounded-full font-semibold">
          {wishlist.length} producto{wishlist.length !== 1 ? 's' : ''}
        </span>
      </div>

      {wishlist.length > 0 ? (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <MaterialIcon name="favorite" filled />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-slate-500 mb-1">{product.category}</p>
                  <Link
                    href={`/products/${product.id}`}
                    className="block font-semibold text-primary mb-2 hover:text-primary/80 truncate"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <span className="text-xs text-slate-500">
                      ⭐ {product.rating} ({product.reviews})
                    </span>
                  </div>

                  <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <MaterialIcon name="shopping_bag" />
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Compare Section */}
          <div className="bg-background-light rounded-lg p-8">
            <h3 className="text-2xl font-bold text-primary mb-6">Comparar Productos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left py-4 font-semibold text-primary">Producto</th>
                    <th className="text-center py-4 font-semibold text-primary">Precio</th>
                    <th className="text-center py-4 font-semibold text-primary">Calificación</th>
                    <th className="text-center py-4 font-semibold text-primary">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlist.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-200 hover:bg-white transition-colors"
                    >
                      <td className="py-4">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-primary hover:underline font-semibold"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="text-center py-4 font-bold text-primary">
                        ${product.price}
                      </td>
                      <td className="text-center py-4">
                        <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ⭐ {product.rating}
                        </span>
                      </td>
                      <td className="text-center py-4">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded">
                          En Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <MaterialIcon name="favorite_border" className="text-slate-300 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Tu wishlist está vacía</h2>
          <p className="text-slate-600 mb-6">
            Agrega productos a tu lista de deseos para guardarlos para después
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Explorar Productos
          </Link>
        </div>
      )}
    </div>
  );
}
