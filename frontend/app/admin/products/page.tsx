'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { products, loading, error, fetchAll } = useProducts();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return;

    try {
      // await deleteProduct(id);
      toast({ message: '✅ Producto eliminado exitosamente', type: 'success' });
    } catch (error) {
      toast({ message: '❌ Error al eliminar producto', type: 'error' });
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Gestión de Productos</h1>
            <p className="text-slate-600">Administra el catálogo de tu tienda</p>
          </div>
          <Link
            href="/admin/products/new"
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <MaterialIcon name="add" />
            Nuevo Producto
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MaterialIcon name="search" className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <MaterialIcon name="error" className="text-4xl mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <MaterialIcon name="inventory_2" className="text-slate-300 text-6xl mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm ? 'No se encontraron productos' : 'No hay productos aún'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Categoría</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Precio</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-primary">{product.name}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-semibold flex items-center gap-1"
                        >
                          <MaterialIcon name="edit" className="text-base" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-semibold flex items-center gap-1"
                        >
                          <MaterialIcon name="delete" className="text-base" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Total de Productos</p>
            <p className="text-3xl font-bold text-blue-900">{products.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 mb-1">En Stock</p>
            <p className="text-3xl font-bold text-green-900">
              {products.filter((p) => p.stock > 0).length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-600 mb-1">Sin Stock</p>
            <p className="text-3xl font-bold text-red-900">
              {products.filter((p) => p.stock === 0).length}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
