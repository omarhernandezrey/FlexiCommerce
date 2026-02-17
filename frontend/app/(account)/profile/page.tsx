'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { IMAGES } from '@/lib/constants';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+34 612 345 678',
    address: 'Calle Principal 123',
    city: 'Madrid',
    country: 'España',
    zipCode: '28001',
  });

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile updated:', formData);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-center mb-6">
            <img
              src={IMAGES.userAvatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-xl font-bold text-primary">{formData.name}</h2>
            <p className="text-sm text-slate-600">{formData.email}</p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 text-slate-600">
              <MaterialIcon name="shopping_bag" />
              <div>
                <p className="text-xs text-slate-500">Total de Compras</p>
                <p className="font-semibold text-primary">$2,450.00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MaterialIcon name="grade" />
              <div>
                <p className="text-xs text-slate-500">Membresía</p>
                <p className="font-semibold text-primary">Premium</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MaterialIcon name="card_giftcard" />
              <div>
                <p className="text-xs text-slate-500">Puntos Disponibles</p>
                <p className="font-semibold text-primary">2,450 pts</p>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-6 border-2 border-primary text-primary font-semibold py-2 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <MaterialIcon name="edit" />
              Editar Perfil
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
          {isEditing ? (
            <>
              <h3 className="text-xl font-bold text-primary mb-6">Editar Información</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Nombre</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">País</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-primary mb-6">Información Personaldel</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Nombre Completo</p>
                    <p className="font-semibold text-primary">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-semibold text-primary">{formData.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Teléfono</p>
                  <p className="font-semibold text-primary">{formData.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Dirección</p>
                  <p className="font-semibold text-primary">{formData.address}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Ciudad</p>
                    <p className="font-semibold text-primary">{formData.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">País</p>
                    <p className="font-semibold text-primary">{formData.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Código Postal</p>
                    <p className="font-semibold text-primary">{formData.zipCode}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
