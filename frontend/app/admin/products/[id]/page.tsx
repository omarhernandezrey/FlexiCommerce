'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductAdmin } from '@/hooks/useProductAdmin';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { formatCOPRaw, parseCOP } from '@/lib/format';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    + '-' + Date.now().toString(36);
}

// ─── Componente: gestión de imágenes ──────────────────────────────────────────
function ImagesManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const [urlError, setUrlError] = useState('');

  const addImage = () => {
    const url = input.trim();
    setUrlError('');
    if (!url) return;
    if (images.includes(url)) { setUrlError('Esta imagen ya fue agregada'); return; }
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) { setUrlError('Solo URLs http/https'); return; }
    } catch {
      setUrlError('URL inválida. Debe empezar con https://');
      return;
    }
    onChange([...images, url]);
    setInput('');
  };

  const removeImage = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const moveImage = (from: number, to: number) => {
    const arr = [...images];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      {/* Imágenes actuales */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group w-24 h-24">
              <img
                src={url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover rounded-xl border border-slate-200"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-semibold">Principal</span>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button onClick={() => moveImage(idx, idx - 1)} className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white" title="Mover izquierda">
                    <MaterialIcon name="chevron_left" className="text-slate-700 text-sm" />
                  </button>
                )}
                <button onClick={() => removeImage(idx)} className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" title="Eliminar">
                  <MaterialIcon name="close" className="text-white text-sm" />
                </button>
                {idx < images.length - 1 && (
                  <button onClick={() => moveImage(idx, idx + 1)} className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white" title="Mover derecha">
                    <MaterialIcon name="chevron_right" className="text-slate-700 text-sm" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input para agregar URL */}
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => { setInput(e.target.value); if (urlError) setUrlError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
        />
        <button
          type="button"
          onClick={addImage}
          disabled={!input.trim()}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Agregar
        </button>
      </div>
      {urlError && <p className="text-red-500 text-xs">{urlError}</p>}
      <p className="text-xs text-slate-400">La primera imagen es la principal. Puedes reordenar con las flechas.</p>
    </div>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────
export default function AdminProductFormPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as string;
  const isEdit = productId !== 'new';

  const { product, fetchById, create, update, loading } = useProductAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    images: [] as string[],
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Carga ────────────────────────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/api/categories').then((res) => {
      const data = (res.data as any)?.data ?? res.data;
      if (Array.isArray(data)) setCategories(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) fetchById(productId);
  }, [isEdit, productId, fetchById]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        price: product.price ? formatCOPRaw(Number(product.price)) : '',
        stock: String(product.stock ?? ''),
        categoryId: (product as any).categoryId ?? product.category?.id ?? '',
        images: Array.isArray(product.images) ? product.images : [],
        isActive: product.isActive ?? true,
      });
      setSlugEdited(true); // al editar, el slug ya existe, no auto-regenerar
    }
  }, [product]);

  // ─── Auto-slug al escribir nombre (solo al crear) ─────────────────────────
  const handleNameChange = (value: string) => {
    setForm((prev) => {
      const next = { ...prev, name: value };
      if (!isEdit && !slugEdited) {
        next.slug = value
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
          .replace(/\s+/g, '-').replace(/-+/g, '-');
      }
      return next;
    });
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleChange = useCallback(<K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  }, [errors]);

  // ─── Validación ───────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.slug.trim()) e.slug = 'El slug es requerido';
    if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Solo minúsculas, números y guiones';
    if (!form.description.trim()) e.description = 'La descripción es requerida';
    const priceNum = parseCOP(form.price);
    if (!form.price || isNaN(priceNum) || priceNum < 0) e.price = 'Precio inválido';
    if (form.stock === '' || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) e.stock = 'Stock debe ser ≥ 0';
    if (!form.categoryId) e.categoryId = 'Selecciona una categoría';
    return e;
  };

  // ─── Envío ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name.trim()),
        description: form.description.trim(),
        price: parseCOP(form.price),
        stock: parseInt(form.stock),
        categoryId: form.categoryId,
        images: form.images,
        isActive: form.isActive,
      };

      if (isEdit) {
        await update(productId, payload);
        toast({ message: 'Producto actualizado exitosamente', type: 'success' });
      } else {
        await create(payload);
        toast({ message: 'Producto creado exitosamente', type: 'success' });
      }

      setTimeout(() => router.push('/admin/products'), 800);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? `Error al ${isEdit ? 'actualizar' : 'crear'} el producto`;
      toast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading && isEdit && !product) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-b-transparent mx-auto mb-4" />
            <p className="text-slate-500">Cargando producto...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const descriptionLength = form.description.length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="mb-8">
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm mb-4">
              <MaterialIcon name="arrow_back" className="text-base" />
              Volver al catálogo
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {isEdit ? `Editando: ${product?.name ?? ''}` : 'Completa los campos para agregar al catálogo'}
                </p>
              </div>
              {/* Toggle publicado */}
              <button
                type="button"
                onClick={() => handleChange('isActive', !form.isActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  form.isActive
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <MaterialIcon name={form.isActive ? 'visibility' : 'visibility_off'} className="text-base" />
                {form.isActive ? 'Publicado' : 'Borrador'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Información básica ─────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <MaterialIcon name="description" className="text-primary text-lg" />
                Información básica
              </h2>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                    errors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'
                  }`}
                  placeholder="Ej. Smartphone Samsung Galaxy S24"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => { setSlugEdited(true); handleChange('slug', e.target.value); }}
                    className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm font-mono ${
                      errors.slug ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="mi-producto-ejemplo"
                  />
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => { setSlugEdited(false); handleChange('slug', form.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')); }}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors text-xs"
                    >
                      Regenerar
                    </button>
                  )}
                </div>
                {errors.slug ? (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                ) : (
                  <p className="text-slate-400 text-xs mt-1">Solo minúsculas, números y guiones. Se usa en la URL del producto.</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 resize-none text-sm ${
                    errors.description ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'
                  }`}
                  placeholder="Describe el producto con detalle: características, materiales, uso..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  ) : <span />}
                  <p className={`text-xs ${descriptionLength > 1000 ? 'text-amber-500' : 'text-slate-400'}`}>{descriptionLength} caracteres</p>
                </div>
              </div>
            </section>

            {/* ── Precios e inventario ───────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <MaterialIcon name="payments" className="text-primary text-lg" />
                Precios e Inventario
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.price}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        handleChange('price', raw ? formatCOPRaw(Number(raw)) : '');
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                        errors.price ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'
                      }`}
                      placeholder="Ej: 129.900"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    min="0"
                    step="1"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                      errors.stock ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                  {form.stock !== '' && !errors.stock && (
                    <p className={`text-xs mt-1 ${parseInt(form.stock) === 0 ? 'text-red-500' : parseInt(form.stock) <= 10 ? 'text-amber-500' : 'text-green-600'}`}>
                      {parseInt(form.stock) === 0 ? 'Sin stock' : parseInt(form.stock) <= 10 ? 'Stock bajo' : 'En stock'}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Categoría ─────────────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <MaterialIcon name="category" className="text-primary text-lg" />
                Categoría
              </h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm bg-white ${
                    errors.categoryId ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary/20 focus:border-primary'
                  }`}
                >
                  <option value="">-- Seleccionar categoría --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                {categories.length === 0 && (
                  <p className="text-amber-500 text-xs mt-1">
                    No hay categorías. <Link href="/admin/categories" className="underline">Crear categorías</Link> primero.
                  </p>
                )}
              </div>
            </section>

            {/* ── Imágenes ─────────────────────────────────────────────────── */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                <MaterialIcon name="photo_library" className="text-primary text-lg" />
                Imágenes del producto
                <span className="ml-auto text-xs text-slate-400 font-normal">{form.images.length} imagen{form.images.length !== 1 ? 'es' : ''}</span>
              </h2>
              <ImagesManager images={form.images} onChange={(imgs) => handleChange('images', imgs)} />
            </section>

            {/* ── Acciones ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin" /> Guardando...</>
                ) : (
                  <><MaterialIcon name={isEdit ? 'check_circle' : 'add_circle'} className="text-lg" />
                  {isEdit ? 'Guardar cambios' : 'Crear producto'}</>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              {isEdit && (
                <Link
                  href={`/products/${productId}`}
                  target="_blank"
                  className="px-4 py-3 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <MaterialIcon name="open_in_new" className="text-base" />
                  Ver en tienda
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
