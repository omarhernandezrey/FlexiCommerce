'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';
import { formatCOP } from '@/lib/format';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
  description: '',
};

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  for (let i = 0; i < 10; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

type FilterTab = 'all' | 'active' | 'inactive' | 'expired';

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteCoupon, setConfirmDeleteCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const res = await apiClient.get('/api/coupons');
      const data = (res.data as any)?.data ?? res.data ?? [];
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openAddForm = () => {
    setForm({ ...EMPTY_FORM, code: generateCode() });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive,
      description: coupon.description || '',
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      toast({ message: 'El codigo y el valor son requeridos', type: 'error' });
      return;
    }

    const numValue = parseFloat(form.value);
    if (form.type === 'percentage' && numValue > 100) {
      toast({ message: 'El porcentaje no puede ser mayor a 100', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: numValue,
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        isActive: form.isActive,
        description: form.description || undefined,
      };

      if (editingId) {
        await apiClient.put(`/api/coupons/${editingId}`, payload);
        toast({ message: 'Cupon actualizado exitosamente', type: 'success' });
      } else {
        await apiClient.post('/api/coupons', payload);
        toast({ message: 'Cupon creado exitosamente', type: 'success' });
      }
      await fetchCoupons();
      handleCancel();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Error al guardar el cupon';
      toast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    setConfirmDeleteCoupon(null);
    setDeletingId(coupon.id);
    try {
      await apiClient.delete(`/api/coupons/${coupon.id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast({ message: 'Cupon eliminado', type: 'success' });
    } catch {
      toast({ message: 'Error al eliminar el cupon', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await apiClient.put(`/api/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast({ message: `Cupon ${!coupon.isActive ? 'activado' : 'desactivado'}`, type: 'success' });
    } catch {
      toast({ message: 'Error al actualizar el estado del cupon', type: 'error' });
    }
  };

  const isExpired = (coupon: Coupon) =>
    coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

  const filtered = coupons
    .filter((c) => {
      if (filterTab === 'active') return c.isActive && !isExpired(c);
      if (filterTab === 'inactive') return !c.isActive;
      if (filterTab === 'expired') return isExpired(c);
      return true;
    })
    .filter((c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getUsagePercent = (coupon: Coupon) =>
    coupon.maxUses ? Math.round((coupon.usedCount / coupon.maxUses) * 100) : null;

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive && !isExpired(c)).length,
    expired: coupons.filter((c) => isExpired(c)).length,
    totalUses: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  };

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Todos', count: coupons.length },
    { key: 'active', label: 'Activos', count: stats.active },
    { key: 'inactive', label: 'Inactivos', count: coupons.filter((c) => !c.isActive).length },
    { key: 'expired', label: 'Vencidos', count: stats.expired },
  ];

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Cupones y Descuentos</h1>
            <p className="text-primary/50 text-sm mt-0.5">Administra codigos promocionales y descuentos</p>
          </div>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              <MaterialIcon name="add" className="text-base" />
              Crear Cupon
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Cupones', value: stats.total, icon: 'local_offer', color: 'text-primary' },
            { label: 'Activos', value: stats.active, icon: 'check_circle', color: 'text-green-600' },
            { label: 'Vencidos', value: stats.expired, icon: 'schedule', color: 'text-orange-500' },
            { label: 'Usos Totales', value: stats.totalUses, icon: 'shopping_bag', color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-primary/10 p-4">
              <div className="flex items-center gap-3 mb-2">
                <MaterialIcon name={stat.icon} className={`text-xl ${stat.color}`} />
                <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-primary text-lg">
                {editingId ? 'Editar Cupon' : 'Nuevo Cupon'}
              </h2>
              <button onClick={handleCancel} className="text-primary/40 hover:text-primary transition-colors">
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  Codigo de Cupon <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g. SUMMER20"
                    className="flex-1 h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, code: generateCode() })}
                    className="px-3 h-10 border border-primary/10 rounded-lg text-xs font-bold text-primary/60 hover:bg-primary/5 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <MaterialIcon name="refresh" className="text-sm" />
                    Generar
                  </button>
                </div>
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Tipo de Descuento</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo (COP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary/40">
                      {form.type === 'percentage' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={form.type === 'percentage' ? '100' : undefined}
                      step="0.01"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      required
                      placeholder={form.type === 'percentage' ? '20' : '10000'}
                      className="w-full h-10 pl-7 pr-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Min Order + Max Uses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Monto Minimo de Orden</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 = sin minimo"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Usos Maximos</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="Ilimitado"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Expiry + Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Descripcion</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Ej. Oferta de verano 2026"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-semibold text-primary">Activo (puede ser usado por clientes)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCancel} className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Cupon' : 'Crear Cupon'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-primary/5 rounded-xl p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterTab === tab.key
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-primary/50 hover:text-primary'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base" />
            <input
              type="text"
              placeholder="Buscar por codigo o descripcion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 border border-primary/10 rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-primary/10 p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-28 h-10 bg-primary/10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-primary/10 rounded" />
                    <div className="h-3 w-32 bg-primary/5 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="size-8 bg-primary/5 rounded-lg" />
                    <div className="size-8 bg-primary/5 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-xl border border-primary/10 p-16 text-center">
            <MaterialIcon name="error_outline" className="text-5xl text-red-400 mb-4" />
            <h3 className="font-extrabold text-primary text-lg mb-2">Error al cargar cupones</h3>
            <p className="text-sm text-primary/50 mb-4">No se pudo conectar con el servidor</p>
            <button onClick={fetchCoupons} className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
              <MaterialIcon name="refresh" className="text-base" />
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-primary/10 p-16 text-center">
            <MaterialIcon name="local_offer" className="text-5xl text-primary/20 mb-4" />
            <h3 className="font-extrabold text-primary text-lg mb-2">
              {searchTerm || filterTab !== 'all' ? 'No hay cupones que coincidan' : 'Sin cupones aun'}
            </h3>
            {!searchTerm && filterTab === 'all' && (
              <button onClick={openAddForm} className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
                <MaterialIcon name="add" className="text-base" />
                Crear Primer Cupon
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((coupon) => {
              const expired = isExpired(coupon);
              const usagePct = getUsagePercent(coupon);
              return (
                <div
                  key={coupon.id}
                  className={`bg-white rounded-xl border p-5 transition-all ${
                    expired ? 'border-orange-200 opacity-75' : coupon.isActive ? 'border-primary/10' : 'border-primary/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Left: Code + Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Code Badge */}
                      <div className={`px-4 py-2 rounded-xl border-2 border-dashed shrink-0 ${
                        expired ? 'border-orange-300 bg-orange-50' : coupon.isActive ? 'border-primary/30 bg-primary/5' : 'border-primary/10 bg-primary/[0.02]'
                      }`}>
                        <span className={`font-mono font-extrabold text-sm tracking-widest ${expired ? 'text-orange-600' : 'text-primary'}`}>
                          {coupon.code}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-primary text-base">
                            {coupon.type === 'percentage'
                              ? `${coupon.value}% de descuento`
                              : `${formatCOP(coupon.value)} de descuento`}
                          </span>
                          {coupon.minOrderAmount ? (
                            <span className="text-xs text-primary/40">min {formatCOP(coupon.minOrderAmount)}</span>
                          ) : null}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            expired
                              ? 'bg-orange-50 text-orange-600'
                              : coupon.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-primary/5 text-primary/40'
                          }`}>
                            {expired ? 'Vencido' : coupon.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-primary/50 mt-0.5">{coupon.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-primary/40">
                            {coupon.usedCount} usos{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                          </span>
                          {coupon.expiresAt && (
                            <span className="text-xs text-primary/40">
                              Vence: {new Date(coupon.expiresAt).toLocaleDateString('es-CO')}
                            </span>
                          )}
                          {coupon.createdAt && (
                            <span className="text-xs text-primary/30">
                              Creado: {new Date(coupon.createdAt).toLocaleDateString('es-CO')}
                            </span>
                          )}
                        </div>
                        {usagePct !== null && (
                          <div className="w-32 h-1 bg-primary/10 rounded-full mt-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-orange-400' : 'bg-primary'}`}
                              style={{ width: `${Math.min(usagePct, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!expired && (
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${coupon.isActive ? 'bg-primary' : 'bg-primary/20'}`}
                        >
                          <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${coupon.isActive ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditForm(coupon)}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
                      >
                        <MaterialIcon name="edit" className="text-base" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteCoupon(coupon)}
                        disabled={deletingId === coupon.id}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-primary/40 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <MaterialIcon name="delete" className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                  <MaterialIcon name="delete" className="text-red-500 text-xl" />
                </div>
                <h3 className="font-extrabold text-primary text-lg">Eliminar Cupon</h3>
              </div>
              <p className="text-sm text-primary/60 mb-1">
                Estas seguro de eliminar el cupon:
              </p>
              <p className="font-mono font-extrabold text-primary text-base mb-6">
                {confirmDeleteCoupon.code}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteCoupon(null)}
                  className="flex-1 py-2.5 border-2 border-primary/20 text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteCoupon)}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
