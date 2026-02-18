'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { items, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
    }
  }, [isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="mb-6">
          <div className="text-4xl">🤍</div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Tu lista está vacía</h2>
        <p className="text-gray-500 mb-6">
          Guarda tus productos favoritos para acceder a ellos fácilmente más tarde
        </p>
        <Link href="/products" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Explorar Productos
        </Link>
      </div>
    );
  }

  const stats = {
    total: items.length,
    minPrice: Math.min(...items.map(item => item.price)),
    maxPrice: Math.max(...items.map(item => item.price)),
    totalValue: items.reduce((sum, item) => sum + item.price, 0),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Lista de Deseos</h1>
        <p className="text-gray-600">{items.length} producto(s) guardado(s)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Total de items</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Precio mínimo</p>
          <p className="text-2xl font-bold text-gray-900">${stats.minPrice.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Precio máximo</p>
          <p className="text-2xl font-bold text-gray-900">${stats.maxPrice.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 text-sm">Valor total</p>
          <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative bg-gray-100 h-48 overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Category */}
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                {item.category}
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {item.productName}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <p className="text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link
                  href={`/products/${item.productId}`}
                  className="block w-full text-center bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-200"
                >
                  Ver Producto
                </Link>

                <button
                  onClick={() => removeFromWishlist(item.id, item.productName)}
                  className="w-full bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clear Button */}
      <div className="flex justify-center">
        <button
          onClick={() => clearWishlist()}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Vaciar Lista de Deseos
        </button>
      </div>
    </div>
  );
}
