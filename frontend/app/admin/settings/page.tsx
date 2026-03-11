'use client';

import { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/useToast';

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    currency: 'COP',
    timezone: 'America/Bogota',
  });

  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { toasts, toast } = useToast();
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [wompiEnabled, setWompiEnabled] = useState(true);
  const [shippingSettings, setShippingSettings] = useState({
    domesticRate: '15000',
    freeThreshold: '200000',
  });

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get('/api/admin/settings');
        const data = (res.data as any)?.data ?? res.data;
        if (data.storeName !== undefined) setSettings((prev) => ({ ...prev, ...data }));
        if (typeof data.stripeEnabled === 'boolean') setStripeEnabled(data.stripeEnabled);
        if (typeof data.paypalEnabled === 'boolean') setPaypalEnabled(data.paypalEnabled);
        if (typeof data.wompiEnabled === 'boolean') setWompiEnabled(data.wompiEnabled);
        if (data.shipping) setShippingSettings(data.shipping);
        if (data.logoUrl) { setLogoUrl(data.logoUrl); setLogoPreview(data.logoUrl); }
      } catch {
        // Endpoint may not exist yet — use defaults silently
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/admin/settings', {
        ...settings,
        logoUrl,
        stripeEnabled,
        paypalEnabled,
        wompiEnabled,
        shipping: shippingSettings,
      });
      setLastSaved(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
      toast({ message: 'Configuración guardada exitosamente', type: 'success' });
    } catch {
      toast({ message: 'Error al guardar la configuración. Inténtalo de nuevo.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ message: 'El archivo excede el límite de 2MB', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogoUrl(base64);
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: 'store' },
    { id: 'payments', label: 'Métodos de Pago', icon: 'payment' },
    { id: 'shipping', label: 'Reglas de Envío', icon: 'local_shipping' },
    { id: 'taxes', label: 'Configuración Fiscal', icon: 'receipt' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 lg:p-8 flex-1 space-y-6 pb-24">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Configuración de la Tienda</h1>
          <p className="text-primary/60 text-sm mt-1">
            Configura la información de tu tienda, pagos y reglas de envío
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary/10 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/40 hover:text-primary'
              }`}
            >
              <MaterialIcon name={tab.icon} className="text-base" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* General Info Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Store Branding Card */}
            <div className="bg-white rounded-xl border border-primary/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon name="palette" className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary">Marca de la Tienda</h3>
                  <p className="text-xs text-primary/40">Actualiza la identidad de tu tienda</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Nombre de la Tienda</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Correo de Soporte</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Moneda</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    >
                      <option value="USD">USD — Dólar Estadounidense</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — Libra Esterlina</option>
                      <option value="MXN">MXN — Peso Mexicano</option>
                      <option value="COP">COP — Peso Colombiano</option>
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Logo de la Tienda</label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="size-16 rounded-xl border border-primary/10 overflow-hidden bg-primary/5 shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-primary/20 rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer group text-left"
                    >
                      <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                        <MaterialIcon name={logoPreview ? 'swap_horiz' : 'upload_file'} className="text-primary text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">
                          {logoPreview ? 'Cambiar logo' : 'Subir logo de tienda'}
                        </p>
                        <p className="text-xs text-primary/40">Clic para subir · SVG, PNG o JPG · máx 2MB</p>
                      </div>
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => { setLogoUrl(''); setLogoPreview(''); }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar logo"
                      >
                        <MaterialIcon name="delete" className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl border border-primary/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon name="location_on" className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary">Dirección de la Tienda</h3>
                  <p className="text-xs text-primary/40">Usada para cálculos de envío y facturas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Dirección</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={settings.zipCode}
                      onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">País</label>
                    <input
                      type="text"
                      value={settings.country}
                      onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-primary/10 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MaterialIcon name="payment" className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary">Métodos de Pago</h3>
                <p className="text-xs text-primary/40">Conecta tus proveedores de pago</p>
              </div>
            </div>

            {/* Stripe */}
            <div className="flex items-center justify-between p-5 rounded-xl border border-primary/10 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#6772e5]/10 rounded-xl flex items-center justify-center">
                  <span className="text-[#6772e5] font-extrabold text-lg">S</span>
                </div>
                <div>
                  <p className="font-extrabold text-primary">Stripe</p>
                  <p className="text-xs text-primary/40">
                    {stripeEnabled ? '✓ Conectado · Modo producción' : 'No conectado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  stripeEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stripeEnabled ? 'Conectado' : 'Desconectado'}
                </span>
                <button
                  onClick={() => setStripeEnabled(!stripeEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    stripeEnabled ? 'bg-primary' : 'bg-primary/20'
                  }`}
                >
                  <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                    stripeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* PayPal */}
            <div className="flex items-center justify-between p-5 rounded-xl border border-primary/10 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#003087]/10 rounded-xl flex items-center justify-center">
                  <span className="text-[#003087] font-extrabold text-lg">P</span>
                </div>
                <div>
                  <p className="font-extrabold text-primary">PayPal</p>
                  <p className="text-xs text-primary/40">
                    {paypalEnabled ? '✓ Conectado' : 'Haz clic para conectar tu cuenta de PayPal'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  paypalEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {paypalEnabled ? 'Conectado' : 'Desconectado'}
                </span>
                <button
                  onClick={() => setPaypalEnabled(!paypalEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    paypalEnabled ? 'bg-primary' : 'bg-primary/20'
                  }`}
                >
                  <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                    paypalEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Wompi */}
            <div className="flex items-center justify-between p-5 rounded-xl border border-primary/10 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-extrabold text-lg">W</span>
                </div>
                <div>
                  <p className="font-extrabold text-primary">Wompi</p>
                  <p className="text-xs text-primary/40">
                    {wompiEnabled ? '✓ Activo · Pasarela de pagos Colombia' : 'Desactivado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  wompiEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {wompiEnabled ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => setWompiEnabled(!wompiEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    wompiEnabled ? 'bg-primary' : 'bg-primary/20'
                  }`}
                >
                  <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                    wompiEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="bg-white rounded-xl border border-primary/10 p-6 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MaterialIcon name="local_shipping" className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary">Lógica de Envío</h3>
                <p className="text-xs text-primary/40">Configura tarifas y reglas de entrega</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">
                  Tarifa Doméstica Fija
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-sm">$</span>
                  <input
                    type="number"
                    value={shippingSettings.domesticRate}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, domesticRate: e.target.value })}
                    className="w-full h-11 pl-7 pr-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">
                  Umbral de Envío Gratis
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-sm">$</span>
                  <input
                    type="number"
                    value={shippingSettings.freeThreshold}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, freeThreshold: e.target.value })}
                    className="w-full h-11 pl-7 pr-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Tab */}
        {activeTab === 'taxes' && (
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MaterialIcon name="receipt" className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary">Configuración de Impuestos</h3>
                <p className="text-xs text-primary/40">Administra tasas de impuestos por región</p>
              </div>
            </div>
            <div className="text-center py-10">
              <MaterialIcon name="receipt_long" className="text-primary/20 text-5xl mb-3" />
              <p className="text-primary/60 font-medium text-sm">Configuración de impuestos próximamente</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-primary/10 px-4 sm:px-8 py-4 flex items-center justify-between z-30 shadow-lg">
        <p className="text-xs text-primary/40 font-medium">
          {lastSaved ? `Último guardado a las ${lastSaved}` : 'Sin cambios guardados aún'}
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-2 border border-primary/10 text-primary/60 font-bold rounded-lg hover:bg-primary/5 transition-colors text-sm">
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <MaterialIcon name="sync" className="text-base animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 pointer-events-auto ${
              t.type === 'success' ? 'bg-emerald-600 text-white' :
              t.type === 'error' ? 'bg-red-600 text-white' :
              'bg-primary text-white'
            }`}
          >
            <MaterialIcon
              name={t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
              className="text-base shrink-0"
            />
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
