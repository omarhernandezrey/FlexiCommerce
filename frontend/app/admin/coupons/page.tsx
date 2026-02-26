'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ProtectedRoute } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';

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

const generateCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/coupons');
      setCoupons(res.data.coupons || res.data || []);
    } catch {
      setCoupons([]);
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
      toast({ message: 'Code and value are required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        isActive: form.isActive,
        description: form.description || undefined,
      };

      if (editingId) {
        await apiClient.put(`/coupons/${editingId}`, payload);
        toast({ message: 'Coupon updated successfully', type: 'success' });
      } else {
        await apiClient.post('/coupons', payload);
        toast({ message: 'Coupon created successfully', type: 'success' });
      }
      await fetchCoupons();
      handleCancel();
    } catch {
      toast({ message: 'Error saving coupon', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast({ message: 'Coupon deleted', type: 'success' });
    } catch {
      toast({ message: 'Error deleting coupon', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await apiClient.put(`/coupons/${coupon.id}`, { ...coupon, isActive: !coupon.isActive });
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch {
      toast({ message: 'Error updating coupon status', type: 'error' });
    }
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (coupon: Coupon) =>
    coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

  const getUsagePercent = (coupon: Coupon) =>
    coupon.maxUses ? Math.round((coupon.usedCount / coupon.maxUses) * 100) : null;

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive && !isExpired(c)).length,
    expired: coupons.filter((c) => isExpired(c)).length,
    totalUses: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Coupons & Discounts</h1>
            <p className="text-primary/50 text-sm mt-0.5">Manage promotional codes and discounts</p>
          </div>
          {!showForm && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              <MaterialIcon name="add" className="text-base" />
              Create Coupon
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Coupons', value: stats.total, icon: 'local_offer', color: 'text-primary' },
            { label: 'Active', value: stats.active, icon: 'check_circle', color: 'text-green-600' },
            { label: 'Expired', value: stats.expired, icon: 'schedule', color: 'text-orange-500' },
            { label: 'Total Uses', value: stats.totalUses, icon: 'shopping_bag', color: 'text-blue-600' },
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
                {editingId ? 'Edit Coupon' : 'New Coupon'}
              </h2>
              <button onClick={handleCancel} className="text-primary/40 hover:text-primary transition-colors">
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  Coupon Code <span className="text-red-500">*</span>
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
                    Generate
                  </button>
                </div>
              </div>

              {/* Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Discount Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">
                    Value <span className="text-red-500">*</span>
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
                      placeholder={form.type === 'percentage' ? '20' : '10.00'}
                      className="w-full h-10 pl-7 pr-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Min Order + Max Uses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Min Order Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 = no minimum"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Max Uses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Expiry + Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Summer sale 2026"
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
                <span className="text-sm font-semibold text-primary">Active (can be used by customers)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCancel} className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                  {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base" />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-primary/10 rounded-xl text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-primary/10 p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-primary/10 p-16 text-center">
            <MaterialIcon name="local_offer" className="text-5xl text-primary/20 mb-4" />
            <h3 className="font-extrabold text-primary text-lg mb-2">
              {searchTerm ? 'No coupons match your search' : 'No coupons yet'}
            </h3>
            {!searchTerm && (
              <button onClick={openAddForm} className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors">
                <MaterialIcon name="add" className="text-base" />
                Create First Coupon
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
                        expired ? 'border-orange-300 bg-orange-50' : coupon.isActive ? 'border-primary/30 bg-primary/5' : 'border-primary/10 bg-primary/2'
                      }`}>
                        <span className={`font-mono font-extrabold text-sm tracking-widest ${expired ? 'text-orange-600' : 'text-primary'}`}>
                          {coupon.code}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-primary text-base">
                            {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}
                          </span>
                          {coupon.minOrderAmount && (
                            <span className="text-xs text-primary/40">min ${coupon.minOrderAmount}</span>
                          )}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            expired
                              ? 'bg-orange-50 text-orange-600'
                              : coupon.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-primary/5 text-primary/40'
                          }`}>
                            {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-primary/50 mt-0.5">{coupon.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-primary/40">
                            {coupon.usedCount} uses{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                          </span>
                          {coupon.expiresAt && (
                            <span className="text-xs text-primary/40">
                              Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
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
                          <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${coupon.isActive ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditForm(coupon)}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-colors"
                      >
                        <MaterialIcon name="edit" className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
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
      </div>
    </ProtectedRoute>
  );
}
