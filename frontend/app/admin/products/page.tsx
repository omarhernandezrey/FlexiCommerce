'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductAdmin } from '@/hooks/useProductAdmin';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { products, loading, error, fetchAll } = useProducts();
  const { deleteProduct } = useProductAdmin();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) return;

    try {
      await deleteProduct(id);
      toast({ message: '✅ Producto eliminado exitosamente', type: 'success' });
      fetchAll();
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
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MaterialIcon name="inventory_2" className="text-primary text-xl" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-primary">Gestión de Productos</h1>
              </div>
              <p className="text-slate-600 ml-0 sm:ml-15">Administra el catálogo y stock de tu tienda</p>
            </div>
            <Link
              href="/admin/products/new"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <MaterialIcon name="add" className="text-lg" />
              Nuevo Producto
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total de Productos</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">{products.length}</p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="shopping_bag" className="text-primary text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">En Stock</p>
                  <p className="text-3xl sm:text-4xl font-bold text-success mt-2">
                    {products.filter((p) => p.stock > 0).length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-success/10 flex items-center justify-center">
                  <MaterialIcon name="check_circle" className="text-success text-2xl" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Sin Stock</p>
                  <p className="text-3xl sm:text-4xl font-bold text-error mt-2">
                    {products.filter((p) => p.stock === 0).length}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-lg bg-error/10 flex items-center justify-center">
                  <MaterialIcon name="warning" className="text-error text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <MaterialIcon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Buscar productos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-b-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <MaterialIcon name="error" className="text-error text-6xl mx-auto mb-4" />
                <p className="text-error font-semibold">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <MaterialIcon name="inventory_2" className="text-slate-300 text-6xl mx-auto mb-4" />
                <p className="text-slate-600 text-lg">
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos aún'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Producto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Categoría</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Precio</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Stock</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-primary">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate">{product.name}</p>
                              <p className="text-sm text-slate-600 line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-primary text-lg">
                            ${product.price.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1 ${
                                product.stock > 10
                                  ? 'bg-success/10 text-success'
                                  : product.stock > 0
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-error/10 text-error'
                              }`}
                            >
                              {product.stock > 10 ? (
                                <MaterialIcon name="check_circle" className="text-lg" />
                              ) : product.stock > 0 ? (
                                <MaterialIcon name="info" className="text-lg" />
                              ) : (
                                <MaterialIcon name="cancel" className="text-lg" />
                              )}
                              {product.stock} unidades
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 font-semibold text-sm flex items-center gap-2"
                            >
                              <MaterialIcon name="edit" className="text-base" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error hover:text-white transition-all duration-200 font-semibold text-sm flex items-center gap-2"
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
              </div>
            )}
          </div>

          {/* Summary info */}
          {filteredProducts.length > 0 && (
            <div className="mt-6 text-center text-slate-600 text-sm">
              Mostrando <span className="font-semibold text-primary">{filteredProducts.length}</span> de <span className="font-semibold text-primary">{products.length}</span> productos
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
