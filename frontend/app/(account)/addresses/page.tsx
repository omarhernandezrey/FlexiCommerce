'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM = {
  label: '',
  firstName: '',
  lastName: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
  isDefault: false,
};

export default function AddressesPage() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/addresses');
      setAddresses(res.data.addresses || res.data || []);
    } catch {
      // Backend not connected — show empty state gracefully
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (address: Address) => {
    setForm({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.street || !form.city || !form.zipCode) {
      toast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/users/addresses/${editingId}`, form);
        toast({ message: 'Address updated successfully', type: 'success' });
      } else {
        await apiClient.post('/users/addresses', form);
        toast({ message: 'Address added successfully', type: 'success' });
      }
      await fetchAddresses();
      handleCancel();
    } catch {
      toast({ message: 'Error saving address. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast({ message: 'Address deleted', type: 'success' });
    } catch {
      toast({ message: 'Error deleting address', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.put(`/users/addresses/${id}/default`, {});
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      toast({ message: 'Default address updated', type: 'success' });
    } catch {
      toast({ message: 'Error updating default address', type: 'error' });
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = 'text',
    required = false
  ) => (
    <div>
      <label className="block text-xs font-bold text-primary mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={required}
        className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30"
      />
    </div>
  );

  return (
    <div className="spacing-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">My Addresses</h1>
          <p className="text-primary/60 text-sm mt-1">Manage your shipping addresses</p>
        </div>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="add" className="text-base" />
            Add Address
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-primary text-lg">
              {editingId ? 'Edit Address' : 'New Address'}
            </h2>
            <button onClick={handleCancel} className="text-primary/40 hover:text-primary transition-colors">
              <MaterialIcon name="close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Label */}
            {field('Label (e.g. Home, Office)', 'label')}

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              {field('First Name', 'firstName', 'text', true)}
              {field('Last Name', 'lastName')}
            </div>

            {/* Street */}
            {field('Street Address', 'street', 'text', true)}

            {/* City / State */}
            <div className="grid grid-cols-2 gap-4">
              {field('City', 'city', 'text', true)}
              {field('State / Province', 'state')}
            </div>

            {/* ZIP / Country */}
            <div className="grid grid-cols-2 gap-4">
              {field('ZIP Code', 'zipCode', 'text', true)}
              {field('Country', 'country')}
            </div>

            {/* Phone */}
            {field('Phone', 'phone', 'tel')}

            {/* Default checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="size-4 accent-primary"
              />
              <span className="text-sm font-semibold text-primary">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-primary/10 p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="size-12 bg-primary/10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-primary/10 rounded w-32" />
                  <div className="h-3 bg-primary/10 rounded w-48" />
                  <div className="h-3 bg-primary/10 rounded w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-primary/10 p-12 text-center">
          <MaterialIcon name="location_off" className="text-5xl text-primary/20 mb-4" />
          <h3 className="font-extrabold text-primary text-lg mb-2">No addresses yet</h3>
          <p className="text-sm text-primary/50 mb-6">Add a shipping address to speed up checkout</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="add" className="text-base" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                address.isDefault ? 'border-primary/30 ring-1 ring-primary/20' : 'border-primary/10'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name={address.label?.toLowerCase().includes('office') ? 'business' : 'home'}
                    className="text-primary text-xl"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-primary text-sm">
                      {address.label || 'Address'}
                    </span>
                    {address.isDefault && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary/70 font-semibold">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-primary/50">{address.street}</p>
                  <p className="text-sm text-primary/50">
                    {address.city}{address.state ? `, ${address.state}` : ''} {address.zipCode}
                  </p>
                  {address.country && <p className="text-sm text-primary/50">{address.country}</p>}
                  {address.phone && <p className="text-sm text-primary/50">{address.phone}</p>}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(address)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary/60 hover:text-primary transition-colors"
                  >
                    <MaterialIcon name="edit" className="text-sm" />
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary/60 hover:text-primary transition-colors"
                    >
                      <MaterialIcon name="check_circle" className="text-sm" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <MaterialIcon name="delete" className="text-sm" />
                    {deletingId === address.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
