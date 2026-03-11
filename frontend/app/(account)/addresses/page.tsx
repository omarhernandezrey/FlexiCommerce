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
      const res = await apiClient.get('/api/users/me/addresses');
      setAddresses(res.data?.data || res.data.addresses || res.data || []);
    } catch {
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
      toast({ message: 'Por favor completa todos los campos requeridos', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/api/users/me/addresses/${editingId}`, form);
        toast({ message: 'Dirección actualizada exitosamente', type: 'success' });
      } else {
        await apiClient.post('/api/users/me/addresses', form);
        toast({ message: 'Dirección agregada exitosamente', type: 'success' });
      }
      await fetchAddresses();
      handleCancel();
    } catch {
      toast({ message: 'Error al guardar la dirección. Por favor intenta de nuevo.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/api/users/me/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast({ message: 'Dirección eliminada', type: 'success' });
    } catch {
      toast({ message: 'Error al eliminar la dirección', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.put(`/api/users/me/addresses/${id}/default`, {});
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      toast({ message: 'Dirección predeterminada actualizada', type: 'success' });
    } catch {
      toast({ message: 'Error al actualizar la dirección predeterminada', type: 'error' });
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
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Mis Direcciones</h1>
          <p className="text-primary/60 text-sm mt-1">Administra tus direcciones de envío</p>
        </div>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="add" className="text-base" />
            Agregar Dirección
          </button>
        )}
      </div>

      {/* Formulario de Agregar / Editar */}
      {showForm && (
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-primary text-lg">
              {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
            </h2>
            <button onClick={handleCancel} className="text-primary/40 hover:text-primary transition-colors">
              <MaterialIcon name="close" className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {field('Etiqueta (ej. Casa, Oficina)', 'label')}

            <div className="grid grid-cols-2 gap-4">
              {field('Nombre', 'firstName', 'text', true)}
              {field('Apellido', 'lastName')}
            </div>

            {field('Dirección', 'street', 'text', true)}

            <div className="grid grid-cols-2 gap-4">
              {field('Ciudad', 'city', 'text', true)}
              {field('Departamento / Provincia', 'state')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {field('Código Postal', 'zipCode', 'text', true)}
              {field('País', 'country')}
            </div>

            {field('Teléfono', 'phone', 'tel')}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="size-4 accent-primary"
              />
              <span className="text-sm font-semibold text-primary">Establecer como dirección predeterminada</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                {saving ? 'Guardando...' : editingId ? 'Actualizar Dirección' : 'Guardar Dirección'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Direcciones */}
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
          <h3 className="font-extrabold text-primary text-lg mb-2">Sin direcciones aún</h3>
          <p className="text-sm text-primary/50 mb-6">Agrega una dirección de envío para agilizar el proceso de pago</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="add" className="text-base" />
            Agregar tu Primera Dirección
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
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <MaterialIcon
                    name={address.label?.toLowerCase().includes('office') || address.label?.toLowerCase().includes('oficina') ? 'business' : 'home'}
                    className="text-primary text-xl"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-primary text-sm">
                      {address.label || 'Dirección'}
                    </span>
                    {address.isDefault && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Predeterminada
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

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(address)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary/60 hover:text-primary transition-colors"
                  >
                    <MaterialIcon name="edit" className="text-sm" />
                    Editar
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary/60 hover:text-primary transition-colors"
                    >
                      <MaterialIcon name="check_circle" className="text-sm" />
                      Predeterminar
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <MaterialIcon name="delete" className="text-sm" />
                    {deletingId === address.id ? 'Eliminando...' : 'Eliminar'}
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
