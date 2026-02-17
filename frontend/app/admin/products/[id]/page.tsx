'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductAdmin } from '@/hooks/useProductAdmin';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/useToast';
import { useForm } from '@/hooks/useForm';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image: string;
}

export default function AdminProductFormPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as string;
  const isEdit = productId !== 'new';

  const { product, fetchById, create, update, loading } = useProductAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && productId) {
      fetchById(productId);
    }
  }, [isEdit, productId, fetchById]);

  const initialValues: ProductForm = {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price.toString() || '',
    stock: product?.stock.toString() || '',
    category: product?.category || '',
    image: product?.image || '',
  };

  const { values, errors, touched, handleChange, handleSubmit } = useForm({
    initialValues,
    validate: (values: ProductForm) => {
      const newErrors: Record<string, string> = {};

      if (!values.name.trim()) newErrors.name = 'Nombre es requerido';
      if (!values.description.trim()) newErrors.description = 'Descripción es requerida';
      if (!values.price) newErrors.price = 'Precio es requerido';
      else if (isNaN(parseFloat(values.price)) || parseFloat(values.price) < 0)
        newErrors.price = 'Precio inválido';

      if (!values.stock) newErrors.stock = 'Stock es requerido';
      else if (!Number.isInteger(parseFloat(values.stock)) || parseFloat(values.stock) < 0)
        newErrors.stock = 'Stock debe ser número entero positivo';

      if (!values.category.trim()) newErrors.category = 'Categoría es requerida';

      return newErrors;
    },
    onSubmit: async (values: ProductForm) => {
      setIsSubmitting(true);
      try {
        const data = {
          name: values.name,
          description: values.description,
          price: parseFloat(values.price),
          stock: parseInt(values.stock),
          category: values.category,
          image: values.image || undefined,
        };

        if (isEdit) {
          await update(productId, data);
          toast({ message: '✅ Producto actualizado exitosamente', type: 'success' });
        } else {
          await create(data);
          toast({ message: '✅ Producto creado exitosamente', type: 'success' });
        }

        setTimeout(() => router.push('/admin/products'), 1000);
      } catch (error) {
        toast({
          message: `❌ Error al ${isEdit ? 'actualizar' : 'crear'} producto`,
          type: 'error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:underline mb-4"
          >
            <MaterialIcon name="arrow_back" />
            Volver
          </button>
          <h1 className="text-4xl font-bold text-primary mb-2">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-slate-600">
            {isEdit ? 'Actualiza la información del producto' : 'Crea un nuevo producto en tu catálogo'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-primary mb-4">Información Básica</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  touched.name && errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'
                }`}
                placeholder="Nombre del producto"
              />
              {touched.name && errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                  touched.description && errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'
                }`}
                placeholder="Descripción detallada del producto"
              />
              {touched.description && errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-primary mb-4">Precios e Inventario</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio ($)</label>
                <input
                  type="number"
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    touched.price && errors.price ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'
                  }`}
                  placeholder="0.00"
                />
                {touched.price && errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={values.stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    touched.stock && errors.stock ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'
                  }`}
                  placeholder="0"
                />
                {touched.stock && errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>
          </div>

          {/* Category & Media */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-primary mb-4">Categoría y Medios</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  touched.category && errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'
                }`}
              >
                <option value="">-- Seleccionar Categoría --</option>
                <option value="electronics">Electrónica</option>
                <option value="clothing">Ropa</option>
                <option value="home">Hogar</option>
                <option value="sports">Deportes</option>
                <option value="books">Libros</option>
              </select>
              {touched.category && errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">URL de Imagen</label>
              <input
                type="text"
                name="image"
                value={values.image}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
              {values.image && (
                <img src={values.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MaterialIcon name={isEdit ? 'check_circle' : 'add_circle'} />
              {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'} Producto
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
