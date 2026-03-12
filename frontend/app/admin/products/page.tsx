'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useProductAdmin, AdminProduct, AdminListParams } from '@/hooks/useProductAdmin';
import { useToast } from '@/hooks/useToast';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { formatCOP } from '@/lib/format';

// ─── Modal ────────────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel = 'Confirmar', variant = 'danger', onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string;
  variant?: 'danger' | 'warning'; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
          <MaterialIcon name="warning" className={`text-3xl ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <h3 className="text-base font-bold text-center text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors text-sm ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const {
    products, pagination, stats, loading, statsLoading,
    fetchAll, fetchStats, deleteProduct, toggleStatus, duplicate, bulkDelete, bulkToggleStatus, purgeInactive,
  } = useProductAdmin();
  const { toast } = useToast();

  // ── Params — ref sincronizado para evitar stale closure en cualquier callback
  const DEFAULT_PARAMS: AdminListParams = { page: 1, limit: 20, status: 'active', sortBy: 'createdAt', sortOrder: 'desc' };
  const [params, setParams] = useState<AdminListParams>(DEFAULT_PARAMS);
  const paramsRef = useRef<AdminListParams>(DEFAULT_PARAMS);

  const updateParams = (next: AdminListParams) => {
    setParams(next);
    paramsRef.current = next;
  };

  const [searchInput, setSearchInput] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [operating, setOperating] = useState(false); // bloquea botones durante operaciones

  const [modal, setModal] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel: string; variant: 'danger' | 'warning'; onConfirm: () => void;
  }>({ open: false, title: '', message: '', confirmLabel: '', variant: 'danger', onConfirm: () => {} });

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // ── Refetch desde servidor ─────────────────────────────────────────────────
  // afterDelete=true → además resetea a "Solo activos" para que los eliminados
  // no vuelvan a aparecer sin importar qué filtro tenía el usuario
  const refetch = async (afterDelete = false) => {
    let p = paramsRef.current;
    if (afterDelete) {
      // Siempre volver a pág 1 + status active después de eliminar
      p = { ...p, page: 1, status: 'active' };
      updateParams(p);
    }
    await Promise.all([fetchAll(p), fetchStats()]);
  };

  // ── Carga inicial
  useEffect(() => {
    fetchAll(DEFAULT_PARAMS);
    fetchStats();
    apiClient.get('/api/categories').then((res) => {
      const d = (res.data as any)?.data ?? res.data;
      if (Array.isArray(d)) setCategories(d);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Limpiar selección al cambiar filtros
  useEffect(() => { setSelected(new Set()); }, [params.page, params.status, params.category]);

  // ── Cambiar filtros
  const applyFilter = (next: Partial<AdminListParams>) => {
    const merged: AdminListParams = { ...paramsRef.current, ...next, page: 1 };
    updateParams(merged);
    fetchAll(merged);
  };

  // ── Búsqueda con debounce
  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilter({ search: value || undefined }), 400);
  };

  // ── Paginación — siempre usa paramsRef
  const goToPage = (page: number) => {
    const next: AdminListParams = { ...paramsRef.current, page };
    updateParams(next);
    fetchAll(next);
  };

  // ── Selección
  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelected((prev) => prev.size === products.length ? new Set() : new Set(products.map((p) => p.id)));

  // ── Limpiar debounce timer al desmontar
  useEffect(() => {
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, []);

  // ── Wrapper para operaciones: bloquea UI, ejecuta, refresca
  // isDelete=true → fuerza status:'active' tras el refetch
  const runOp = async (fn: () => Promise<void>, isDelete = false) => {
    if (operating) return;
    setOperating(true);
    try {
      await fn();
      await refetch(isDelete);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Error en la operación';
      toast({ message: msg, type: 'error' });
    } finally {
      setOperating(false);
    }
  };

  // ── Eliminar individual
  const handleDelete = (product: AdminProduct) => {
    setModal({
      open: true, variant: 'danger',
      title: 'Eliminar producto',
      message: `Se eliminará "${product.name}" permanentemente. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        closeModal();
        runOp(async () => {
          await deleteProduct(product.id);
          toast({ message: `"${product.name}" eliminado`, type: 'success' });
        }, true); // isDelete=true → vuelve a status:active
      },
    });
  };

  // ── Toggle activo/inactivo
  const handleToggle = (product: AdminProduct) => {
    runOp(async () => {
      await toggleStatus(product.id);
      toast({ message: `Producto ${product.isActive ? 'desactivado' : 'activado'}`, type: 'success' });
    }, false); // no resetear página al togglear
  };

  // ── Duplicar
  const handleDuplicate = (product: AdminProduct) => {
    runOp(async () => {
      await duplicate(product.id);
      toast({ message: `"${product.name}" duplicado como borrador`, type: 'success' });
    }, false);
  };

  // ── Eliminar masivo
  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    setModal({
      open: true, variant: 'danger',
      title: `Eliminar ${ids.length} producto${ids.length > 1 ? 's' : ''}`,
      message: `Se eliminarán permanentemente ${ids.length} producto${ids.length > 1 ? 's' : ''}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar todos',
      onConfirm: () => {
        closeModal();
        runOp(async () => {
          await bulkDelete(ids);
          setSelected(new Set());
          toast({ message: `${ids.length} productos eliminados`, type: 'success' });
        }, true); // isDelete=true → vuelve a status:active
      },
    });
  };

  // ── Toggle masivo
  const handleBulkToggle = (isActive: boolean) => {
    const ids = Array.from(selected);
    runOp(async () => {
      await bulkToggleStatus(ids, isActive);
      setSelected(new Set());
      toast({ message: `${ids.length} productos ${isActive ? 'activados' : 'desactivados'}`, type: 'success' });
    }, false);
  };

  // ── Purgar todos los inactivos definitivamente
  const handlePurge = () => {
    const count = stats?.inactive ?? 0;
    if (count === 0) { toast({ message: 'No hay productos inactivos para purgar', type: 'success' }); return; }
    setModal({
      open: true, variant: 'danger',
      title: `Purgar ${count} producto${count > 1 ? 's' : ''} inactivo${count > 1 ? 's' : ''}`,
      message: `Se eliminarán permanentemente de la base de datos ${count} producto${count > 1 ? 's' : ''} inactivo${count > 1 ? 's' : ''}. Esta acción NO se puede deshacer.`,
      confirmLabel: 'Purgar definitivamente',
      onConfirm: () => {
        closeModal();
        runOp(async () => {
          const purged = await purgeInactive();
          toast({ message: `${purged} producto${purged !== 1 ? 's' : ''} purgado${purged !== 1 ? 's' : ''} de la BD`, type: 'success' });
        }, true);
      },
    });
  };

  // ── Exportar CSV (todos los productos, no solo la página actual)
  const exportCSV = async () => {
    try {
      toast({ message: 'Generando CSV...', type: 'success' });
      // Obtener todos los productos del filtro actual sin paginación
      const response = await apiClient.get('/api/products', {
        params: {
          admin: 'true',
          status: paramsRef.current.status ?? 'active',
          category: paramsRef.current.category,
          stock: paramsRef.current.stock,
          search: paramsRef.current.search,
          sortBy: paramsRef.current.sortBy ?? 'createdAt',
          sortOrder: paramsRef.current.sortOrder ?? 'desc',
          limit: 10000, // traer todos
          page: 1,
        },
      });
      const body = response.data as any;
      const allProducts: AdminProduct[] = (Array.isArray(body.data) ? body.data : []).map((p: any) => ({
        ...p,
        price: Number(p.price ?? 0),
        isActive: p.isActive !== undefined ? Boolean(p.isActive) : Boolean(p.is_active ?? true),
        images: Array.isArray(p.images) ? p.images : [],
        category: typeof p.category === 'object' && p.category !== null ? p.category : undefined,
      }));

      const escapeCSV = (val: string | number) => {
        const s = String(val);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const rows = [
        ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Slug'],
        ...allProducts.map((p) => [p.id, escapeCSV(p.name), escapeCSV(p.category?.name ?? ''), Number(p.price).toLocaleString('es-CO'), p.stock, p.isActive ? 'Activo' : 'Inactivo', p.slug]),
      ];
      const blob = new Blob(['\uFEFF' + rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `productos-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast({ message: `CSV exportado (${allProducts.length} productos)`, type: 'success' });
    } catch {
      toast({ message: 'Error al exportar CSV', type: 'error' });
    }
  };

  const allSelected = products.length > 0 && selected.size === products.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <ConfirmModal {...modal} onCancel={closeModal} />

      {/* Overlay bloqueante durante operaciones */}
      {operating && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-xl">
            <div className="w-6 h-6 border-3 border-primary border-b-transparent rounded-full animate-spin" />
            <span className="font-semibold text-slate-700">Procesando...</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50">
        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MaterialIcon name="inventory_2" className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Productos</h1>
                <p className="text-slate-500 text-xs">Administra el catálogo de tu tienda</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Botón purgar — visible solo si hay inactivos */}
              {(stats?.inactive ?? 0) > 0 && (
                <button onClick={handlePurge} disabled={operating}
                  className="px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-40">
                  <MaterialIcon name="delete_sweep" className="text-base" />
                  Purgar inactivos ({stats?.inactive})
                </button>
              )}
              <button onClick={exportCSV} disabled={operating || products.length === 0}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-white transition-colors flex items-center gap-2 text-sm disabled:opacity-40">
                <MaterialIcon name="download" className="text-base" />CSV
              </button>
              <Link href="/admin/products/new"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm shadow-sm">
                <MaterialIcon name="add" className="text-base" />Nuevo Producto
              </Link>
            </div>
          </div>

          {/* ── Stats ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {([
              { label: 'Total BD', value: stats?.total, icon: 'inventory_2', cls: 'text-blue-600 bg-blue-50' },
              { label: 'Activos', value: stats?.active, icon: 'check_circle', cls: 'text-green-600 bg-green-50' },
              { label: 'Inactivos', value: stats?.inactive, icon: 'pause_circle', cls: 'text-slate-500 bg-slate-100' },
              { label: 'Sin stock', value: stats?.outOfStock, icon: 'cancel', cls: 'text-red-600 bg-red-50' },
              { label: 'Stock bajo', value: stats?.lowStock, icon: 'warning', cls: 'text-amber-600 bg-amber-50' },
              { label: 'Inventario', value: stats ? formatCOP(stats.totalValue) : null, icon: 'payments', cls: 'text-purple-600 bg-purple-50' },
            ] as const).map(({ label, value, icon, cls }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-3">
                <div className={`w-7 h-7 rounded-lg mb-2 flex items-center justify-center ${cls}`}>
                  <MaterialIcon name={icon} className="text-sm" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{label}</p>
                <p className="text-lg font-bold text-slate-800">
                  {statsLoading ? <span className="inline-block w-8 h-4 bg-slate-200 animate-pulse rounded" /> : (value ?? 0)}
                </p>
              </div>
            ))}
          </div>

          {/* ── Filtros ───────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[160px]">
              <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar..." value={searchInput} onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>

            <select value={params.category ?? ''} onChange={(e) => applyFilter({ category: e.target.value || undefined })}
              className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Todas las categorías</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Estado — clave del fix: default "active" */}
            <select value={params.status ?? 'active'} onChange={(e) => applyFilter({ status: e.target.value as AdminListParams['status'] })}
              className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
              <option value="all">Ver todos</option>
            </select>

            <select value={params.stock ?? ''} onChange={(e) => applyFilter({ stock: (e.target.value || undefined) as AdminListParams['stock'] })}
              className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Todo el stock</option>
              <option value="out">Sin stock</option>
              <option value="low">Stock bajo</option>
              <option value="in">En stock</option>
            </select>

            <select value={`${params.sortBy ?? 'createdAt'}_${params.sortOrder ?? 'desc'}`}
              onChange={(e) => { const [s, o] = e.target.value.split('_'); applyFilter({ sortBy: s, sortOrder: o as 'asc' | 'desc' }); }}
              className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="createdAt_desc">Más recientes</option>
              <option value="createdAt_asc">Más antiguos</option>
              <option value="name_asc">A-Z</option>
              <option value="name_desc">Z-A</option>
              <option value="price_asc">Precio ↑</option>
              <option value="price_desc">Precio ↓</option>
              <option value="stock_asc">Stock ↑</option>
              <option value="stock_desc">Stock ↓</option>
            </select>

            <select value={params.limit ?? 20} onChange={(e) => applyFilter({ limit: Number(e.target.value) })}
              className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value={10}>10/pág</option>
              <option value={20}>20/pág</option>
              <option value={50}>50/pág</option>
              <option value={100}>100/pág</option>
            </select>
          </div>

          {/* ── Acciones masivas ──────────────────────────────────────────── */}
          {selected.size > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-primary">{selected.size} seleccionado{selected.size > 1 ? 's' : ''}</span>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => handleBulkToggle(true)} disabled={operating}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 flex items-center gap-1">
                  <MaterialIcon name="visibility" className="text-sm" />Activar
                </button>
                <button onClick={() => handleBulkToggle(false)} disabled={operating}
                  className="px-3 py-1.5 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40 flex items-center gap-1">
                  <MaterialIcon name="visibility_off" className="text-sm" />Desactivar
                </button>
                <button onClick={handleBulkDelete} disabled={operating}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 flex items-center gap-1">
                  <MaterialIcon name="delete" className="text-sm" />Eliminar
                </button>
                <button onClick={() => setSelected(new Set())}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100">
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* ── Tabla ────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-b-transparent mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Cargando...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <MaterialIcon name="inventory_2" className="text-slate-200 text-6xl mx-auto mb-3" />
                <p className="text-slate-600 font-semibold mb-1">
                  {params.status === 'active' ? 'No hay productos activos' :
                   params.status === 'inactive' ? 'No hay productos inactivos' : 'No hay productos'}
                </p>
                <p className="text-slate-400 text-sm mb-5">
                  {params.status === 'active' ? 'Los productos eliminados no se muestran aquí' : 'Crea el primero para comenzar'}
                </p>
                <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-colors">
                  <MaterialIcon name="add" />Nuevo Producto
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll}
                          className="w-4 h-4 accent-primary cursor-pointer" />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Producto</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Categoría</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Precio</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Stock</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className={`transition-colors ${selected.has(p.id) ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                            className="w-4 h-4 accent-primary cursor-pointer" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement?.classList.add('img-fallback'); }} />
                                : <MaterialIcon name="image" className="text-slate-300" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[180px]">{p.name}</p>
                              <p className="text-slate-400 text-xs font-mono truncate max-w-[180px]">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                            {p.category?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {formatCOP(p.price)}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {p.stock === 0
                            ? <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Sin stock</span>
                            : p.stock <= 10
                            ? <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{p.stock} uds</span>
                            : <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{p.stock} uds</span>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                            {p.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end items-center gap-1">
                            <button onClick={() => handleToggle(p)} disabled={operating} title={p.isActive ? 'Desactivar' : 'Activar'}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${p.isActive ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                              <MaterialIcon name={p.isActive ? 'toggle_on' : 'toggle_off'} className="text-xl" />
                            </button>
                            <button onClick={() => handleDuplicate(p)} disabled={operating} title="Duplicar"
                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40">
                              <MaterialIcon name="content_copy" className="text-base" />
                            </button>
                            <Link href={`/admin/products/${p.id}`} title="Editar"
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                              <MaterialIcon name="edit" className="text-base" />
                            </Link>
                            <button onClick={() => handleDelete(p)} disabled={operating} title="Eliminar"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                              <MaterialIcon name="delete" className="text-base" />
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

          {/* ── Paginación ────────────────────────────────────────────────── */}
          {pagination && pagination.total > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Mostrando{' '}
                <span className="font-semibold text-slate-700">
                  {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}de <span className="font-semibold text-slate-700">{pagination.total}</span>
              </p>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => goToPage(1)} disabled={pagination.page === 1 || operating}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600">
                    <MaterialIcon name="first_page" className="text-lg" />
                  </button>
                  <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1 || operating}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600">
                    <MaterialIcon name="chevron_left" className="text-lg" />
                  </button>

                  {(() => {
                    const total = pagination.totalPages;
                    const cur = pagination.page;
                    let pages: number[] = [];
                    if (total <= 7) {
                      pages = Array.from({ length: total }, (_, i) => i + 1);
                    } else if (cur <= 4) {
                      pages = [1, 2, 3, 4, 5, -1, total];
                    } else if (cur >= total - 3) {
                      pages = [1, -1, total - 4, total - 3, total - 2, total - 1, total];
                    } else {
                      pages = [1, -1, cur - 1, cur, cur + 1, -2, total];
                    }
                    return pages.map((page, i) =>
                      page < 0 ? (
                        <span key={`sep${i}`} className="w-8 text-center text-slate-400 text-sm">…</span>
                      ) : (
                        <button key={page} onClick={() => goToPage(page)} disabled={operating}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed ${page === cur ? 'bg-primary text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                          {page}
                        </button>
                      )
                    );
                  })()}

                  <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || operating}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600">
                    <MaterialIcon name="chevron_right" className="text-lg" />
                  </button>
                  <button onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages || operating}
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600">
                    <MaterialIcon name="last_page" className="text-lg" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
