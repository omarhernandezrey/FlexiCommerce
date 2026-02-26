'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  label: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

const BRAND_ICONS: Record<string, string> = {
  visa: 'credit_card',
  mastercard: 'credit_card',
  amex: 'credit_card',
  paypal: 'account_balance_wallet',
  bank: 'account_balance',
};

const CARD_BRAND_COLORS: Record<string, string> = {
  visa: 'bg-blue-600',
  mastercard: 'bg-red-500',
  amex: 'bg-green-600',
};

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formType, setFormType] = useState<'card' | 'paypal'>('card');
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false,
  });
  const [paypalForm, setPaypalForm] = useState({
    email: '',
    isDefault: false,
  });

  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/payment-methods');
      setMethods(res.data.paymentMethods || res.data || []);
    } catch {
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleCancel = () => {
    setShowForm(false);
    setCardForm({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', cardholderName: '', isDefault: false });
    setPaypalForm({ email: '', isDefault: false });
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.cardNumber || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cardholderName) {
      toast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/users/payment-methods', {
        type: 'card',
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        expiryMonth: parseInt(cardForm.expiryMonth),
        expiryYear: parseInt(cardForm.expiryYear),
        cvv: cardForm.cvv,
        cardholderName: cardForm.cardholderName,
        isDefault: cardForm.isDefault,
      });
      toast({ message: 'Card added successfully', type: 'success' });
      await fetchMethods();
      handleCancel();
    } catch {
      toast({ message: 'Error adding card. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaypal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paypalForm.email) {
      toast({ message: 'Please enter your PayPal email', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/users/payment-methods', {
        type: 'paypal',
        email: paypalForm.email,
        isDefault: paypalForm.isDefault,
      });
      toast({ message: 'PayPal account added successfully', type: 'success' });
      await fetchMethods();
      handleCancel();
    } catch {
      toast({ message: 'Error adding PayPal account', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/users/payment-methods/${id}`);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast({ message: 'Payment method removed', type: 'success' });
    } catch {
      toast({ message: 'Error removing payment method', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.put(`/users/payment-methods/${id}/default`, {});
      setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
      toast({ message: 'Default payment method updated', type: 'success' });
    } catch {
      toast({ message: 'Error updating default payment method', type: 'error' });
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'paypal') return 'account_balance_wallet';
    if (method.type === 'bank') return 'account_balance';
    return 'credit_card';
  };

  const getMethodLabel = (method: PaymentMethod) => {
    if (method.type === 'paypal') return `PayPal — ${method.email}`;
    if (method.type === 'bank') return method.label;
    const brand = method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1) : 'Card';
    return `${brand} ending in ${method.last4}`;
  };

  const getMethodSub = (method: PaymentMethod) => {
    if (method.type === 'card' && method.expiryMonth && method.expiryYear) {
      return `Expires ${String(method.expiryMonth).padStart(2, '0')}/${method.expiryYear}`;
    }
    return method.label;
  };

  return (
    <div className="spacing-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Payment Methods</h1>
          <p className="text-primary/60 text-sm mt-1">Manage your saved payment methods</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="add" className="text-base" />
            Add Method
          </button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-primary text-lg">Add Payment Method</h2>
            <button onClick={handleCancel} className="text-primary/40 hover:text-primary transition-colors">
              <MaterialIcon name="close" className="text-xl" />
            </button>
          </div>

          {/* Type Selector */}
          <div className="flex gap-3 mb-6">
            {(['card', 'paypal'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormType(type)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  formType === type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-primary/10 text-primary/50 hover:border-primary/30'
                }`}
              >
                <MaterialIcon
                  name={type === 'card' ? 'credit_card' : 'account_balance_wallet'}
                  className="text-lg"
                />
                {type === 'card' ? 'Credit / Debit Card' : 'PayPal'}
              </button>
            ))}
          </div>

          {formType === 'card' ? (
            <form onSubmit={handleSaveCard} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30 tracking-widest"
                />
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardForm.cardholderName}
                  onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                  placeholder="Full name as on card"
                  required
                  className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Month *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardForm.expiryMonth}
                    onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value.slice(0, 2) })}
                    placeholder="MM"
                    maxLength={2}
                    required
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">Year *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardForm.expiryYear}
                    onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value.slice(0, 4) })}
                    placeholder="YYYY"
                    maxLength={4}
                    required
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.slice(0, 4) })}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardForm.isDefault}
                  onChange={(e) => setCardForm({ ...cardForm, isDefault: e.target.checked })}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-semibold text-primary">Set as default payment method</span>
              </label>

              {/* SSL Notice */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <MaterialIcon name="lock" className="text-green-600 text-base" />
                <p className="text-xs text-green-700 font-medium">Your card information is encrypted and secure</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleCancel} className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                  {saving ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSavePaypal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  PayPal Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={paypalForm.email}
                  onChange={(e) => setPaypalForm({ ...paypalForm, email: e.target.value })}
                  placeholder="your@paypal.com"
                  required
                  className="w-full h-10 px-3 border border-primary/10 rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-primary/30"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paypalForm.isDefault}
                  onChange={(e) => setPaypalForm({ ...paypalForm, isDefault: e.target.checked })}
                  className="size-4 accent-primary"
                />
                <span className="text-sm font-semibold text-primary">Set as default payment method</span>
              </label>

              <div className="flex gap-3">
                <button type="button" onClick={handleCancel} className="flex-1 py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <MaterialIcon name="hourglass_bottom" className="text-base" />}
                  {saving ? 'Linking...' : 'Link PayPal'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Methods List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-primary/10 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="size-12 bg-primary/10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-primary/10 rounded w-40" />
                  <div className="h-3 bg-primary/10 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : methods.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-primary/10 p-12 text-center">
          <MaterialIcon name="credit_card_off" className="text-5xl text-primary/20 mb-4" />
          <h3 className="font-extrabold text-primary text-lg mb-2">No payment methods saved</h3>
          <p className="text-sm text-primary/50 mb-6">Save a card or PayPal account for faster checkout</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <MaterialIcon name="add" className="text-base" />
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                method.isDefault ? 'border-primary/30 ring-1 ring-primary/20' : 'border-primary/10'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Card visual / icon */}
                <div
                  className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                    method.type === 'card' && method.brand
                      ? (CARD_BRAND_COLORS[method.brand] || 'bg-primary')
                      : method.type === 'paypal'
                      ? 'bg-blue-500'
                      : 'bg-primary/10'
                  }`}
                >
                  <MaterialIcon
                    name={getMethodIcon(method)}
                    className="text-white text-xl"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-extrabold text-primary text-sm">{getMethodLabel(method)}</span>
                    {method.isDefault && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary/50">{getMethodSub(method)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-xs font-bold text-primary/60 hover:text-primary transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    disabled={deletingId === method.id}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <MaterialIcon name="delete" className="text-sm" />
                    {deletingId === method.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security note */}
      {methods.length > 0 && (
        <div className="flex items-start gap-3 bg-primary/5 rounded-xl p-4 border border-primary/10">
          <MaterialIcon name="security" className="text-primary text-lg shrink-0 mt-0.5" />
          <p className="text-xs text-primary/60 leading-relaxed">
            Your payment information is stored securely with bank-level encryption.
            We never store your full card number or CVV.
          </p>
        </div>
      )}
    </div>
  );
}
