'use client';

import { useCompare } from '@/hooks/useCompare';
import Link from 'next/link';

export default function ComparePage() {
  const { products, removeFromCompare, clearCompare, getSpecifications } = useCompare();

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="mb-6">
          <div className="text-4xl">📊</div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Nada que comparar</h2>
        <p className="text-gray-500 mb-6">
          Selecciona productos para compararlos lado a lado
        </p>
        <Link href="/products" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Explorar Productos
        </Link>
      </div>
    );
  }

  const specifications = getSpecifications();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comparación de Productos</h1>
          <p className="text-gray-600">{products.length} de 4 productos</p>
        </div>
        <button
          onClick={() => clearCompare()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Limpiar Comparación
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full">
          {/* Header with Product Images */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 bg-gray-50 font-semibold text-gray-900 min-w-200px">
                Especificaciones
              </th>
              {products.map((product, idx) => (
                <th key={idx} className="text-center p-4 bg-gray-50 min-w-200px">
                  <div className="relative">
                    <div className="mb-4 h-40 overflow-hidden rounded-lg bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCompare(product.id, product.name)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mt-2 truncate">
                    {product.name}
                  </h3>
                </th>
              ))}
              {/* Empty slots for less than 4 products */}
              {products.length < 4 &&
                [...Array(4 - products.length)].map((_, idx) => (
                  <th key={`empty-${idx}`} className="text-center p-4 bg-gray-50 min-w-200px">
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      Vacío
                    </div>
                  </th>
                ))}
            </tr>
          </thead>

          {/* Specifications Rows */}
          <tbody>
            {/* Price Row */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-900 bg-gray-50">Precio</td>
              {products.map((product, idx) => (
                <td key={idx} className="p-4 text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                </td>
              ))}
              {products.length < 4 &&
                [...Array(4 - products.length)].map((_, idx) => (
                  <td key={`empty-price-${idx}`} className="p-4 text-center">
                    —
                  </td>
                ))}
            </tr>

            {/* Category Row */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-900 bg-gray-50">Categoría</td>
              {products.map((product, idx) => (
                <td key={idx} className="p-4 text-center text-gray-700">
                  {product.category}
                </td>
              ))}
              {products.length < 4 &&
                [...Array(4 - products.length)].map((_, idx) => (
                  <td key={`empty-category-${idx}`} className="p-4 text-center">
                    —
                  </td>
                ))}
            </tr>

            {/* Stock Row */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-900 bg-gray-50">Disponibilidad</td>
              {products.map((product, idx) => (
                <td key={idx} className="p-4 text-center">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    En Stock
                  </span>
                </td>
              ))}
              {products.length < 4 &&
                [...Array(4 - products.length)].map((_, idx) => (
                  <td key={`empty-stock-${idx}`} className="p-4 text-center">
                    —
                  </td>
                ))}
            </tr>

            {/* Description Row */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-900 bg-gray-50">Descripción</td>
              {products.map((product, idx) => (
                <td key={idx} className="p-4 text-center text-sm text-gray-600">
                  {product.description || 'N/A'}
                </td>
              ))}
              {products.length < 4 &&
                [...Array(4 - products.length)].map((_, idx) => (
                  <td key={`empty-desc-${idx}`} className="p-4 text-center">
                    —
                  </td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* View Details Buttons */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, idx) => (
          <Link
            key={idx}
            href={`/products/${product.id}`}
            className="text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Ver Detalles
          </Link>
        ))}
        {products.length < 4 &&
          [...Array(4 - products.length)].map((_, idx) => (
            <div
              key={`empty-btn-${idx}`}
              className="text-center bg-gray-200 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed"
            >
              Vacío
            </div>
          ))}
      </div>
    </div>
  );
}
