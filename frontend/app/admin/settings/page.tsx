'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Main Boutique Store',
    email: 'admin@flexicommerce.com',
    phone: '+34 912 345 678',
    address: 'Calle Principal 123',
    city: 'Madrid',
    zipCode: '28001',
    country: 'España',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Configuración de la Tienda</h1>
        <p className="text-slate-600">Administra la información de tu tienda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <MaterialIcon name="store" />
              Información General
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Nombre de la Tienda
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Settings */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <MaterialIcon name="location_on" />
              Dirección
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) =>
                      setSettings({ ...settings, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={settings.zipCode}
                    onChange={(e) =>
                      setSettings({ ...settings, zipCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={settings.country}
                    onChange={(e) =>
                      setSettings({ ...settings, country: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <MaterialIcon name="globe" />
              Configuración Regional
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Moneda
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="GBP">GBP - Libra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Zona Horaria
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Europe/Madrid">Europe/Madrid</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <MaterialIcon name="save" />
            {saved ? 'Guardado exitosamente' : 'Guardar Configuración'}
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <p className="font-semibold text-green-900">Tienda en Línea</p>
            </div>
            <p className="text-sm text-green-800">
              Tu tienda está operando correctamente y es visible para todos los clientes.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h4 className="font-semibold text-primary mb-4">Estadísticas Rápidas</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-600">Uptime</p>
                <p className="text-2xl font-bold text-primary">99.9%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Visitas Hoy</p>
                <p className="text-2xl font-bold text-primary">2,450</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Conversión</p>
                <p className="text-2xl font-bold text-primary">3.2%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
