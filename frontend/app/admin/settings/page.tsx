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
    currency: 'USD',
    timezone: 'Europe/Madrid',
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [shippingSettings, setShippingSettings] = useState({
    domesticRate: '15.00',
    freeThreshold: '100.00',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: 'store' },
    { id: 'payments', label: 'Payment Gateways', icon: 'payment' },
    { id: 'shipping', label: 'Shipping Rules', icon: 'local_shipping' },
    { id: 'taxes', label: 'Tax Configurations', icon: 'receipt' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 lg:p-8 flex-1 space-y-6 pb-24">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Store Settings</h1>
          <p className="text-primary/60 text-sm mt-1">
            Configure your store information, payments, and shipping rules
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
                  <h3 className="font-extrabold text-primary">Store Branding</h3>
                  <p className="text-xs text-primary/40">Update your store identity</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Support Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    >
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="MXN">MXN — Mexican Peso</option>
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Store Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-2 border-dashed border-primary/20 rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer group">
                      <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <MaterialIcon name="upload_file" className="text-primary text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">logo_primary.svg</p>
                        <p className="text-xs text-primary/40">Click to replace · max 2MB</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-red-200 text-red-500 font-bold text-sm rounded-lg hover:bg-red-50 transition-colors">
                      Remove
                    </button>
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
                  <h3 className="font-extrabold text-primary">Store Address</h3>
                  <p className="text-xs text-primary/40">Used for shipping calculations and invoices</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Street Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">City</label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={settings.zipCode}
                      onChange={(e) => setSettings({ ...settings, zipCode: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Country</label>
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
                <h3 className="font-extrabold text-primary">Payment Methods</h3>
                <p className="text-xs text-primary/40">Connect your payment providers</p>
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
                    {stripeEnabled ? '✓ Connected · Live mode' : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  stripeEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {stripeEnabled ? 'Connected' : 'Disconnected'}
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
                    {paypalEnabled ? '✓ Connected' : 'Click to connect your PayPal account'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  paypalEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {paypalEnabled ? 'Connected' : 'Disconnected'}
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
                <h3 className="font-extrabold text-primary">Shipping Logic</h3>
                <p className="text-xs text-primary/40">Configure delivery rates and rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <label className="block text-xs font-bold text-primary/60 uppercase tracking-wider mb-3">
                  Domestic Flat Rate
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
                  Free Shipping Threshold
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
                <h3 className="font-extrabold text-primary">Tax Configurations</h3>
                <p className="text-xs text-primary/40">Manage tax rates by region</p>
              </div>
            </div>
            <div className="text-center py-10">
              <MaterialIcon name="receipt_long" className="text-primary/20 text-5xl mb-3" />
              <p className="text-primary/60 font-medium text-sm">Tax configuration coming soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-primary/10 px-4 sm:px-8 py-4 flex items-center justify-between z-30 shadow-lg">
        <p className="text-xs text-primary/40 font-medium">
          Last autosaved at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-2 border border-primary/10 text-primary/60 font-bold rounded-lg hover:bg-primary/5 transition-colors text-sm">
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
          >
            {saved && <MaterialIcon name="check" className="text-base" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
