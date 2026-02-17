'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface PaymentFormProps {
  onNext: (paymentMethod: PaymentMethod) => void;
}

export type PaymentMethod = 'card' | 'paypal' | 'transfer';

export function PaymentForm({ onNext }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
  });

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cardNumber') {
      finalValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      finalValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    } else if (name === 'cvc') {
      finalValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData({ ...cardData, [name]: finalValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(paymentMethod);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        {[
          { value: 'card', label: 'Tarjeta de Crédito/Débito', icon: 'credit_card' },
          { value: 'paypal', label: 'PayPal', icon: 'paid' },
          { value: 'transfer', label: 'Transferencia Bancaria', icon: 'account_balance' },
        ].map((method) => (
          <label
            key={method.value}
            className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
            style={{
              borderColor:
                paymentMethod === method.value ? '#0f1729' : '#e2e8f0',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={paymentMethod === method.value}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-4 h-4"
            />
            <MaterialIcon name={method.icon} className="mx-3 text-primary" />
            <span className="font-semibold text-primary">{method.label}</span>
          </label>
        ))}
      </div>

      {/* Card Details */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 bg-slate-50 p-6 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Número de Tarjeta
            </label>
            <input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleCardChange}
              maxLength={19}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Nombre en la Tarjeta
            </label>
            <input
              type="text"
              name="cardName"
              placeholder="Juan Pérez"
              value={cardData.cardName}
              onChange={handleCardChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Vencimiento
              </label>
              <input
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={handleCardChange}
                maxLength={5}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                CVC
              </label>
              <input
                type="text"
                name="cvc"
                placeholder="123"
                value={cardData.cvc}
                onChange={handleCardChange}
                maxLength={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* PayPal Info */}
      {paymentMethod === 'paypal' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <MaterialIcon name="info" className="text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-700">
            Serás redirigido a PayPal para completar el pago de forma segura.
          </p>
        </div>
      )}

      {/* Bank Transfer Info */}
      {paymentMethod === 'transfer' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <MaterialIcon name="info" className="text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-700">
            Recibirás los detalles bancarios después de confirmar. Tu orden será procesada una vez se reciba el pago.
          </p>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        Revisar Orden
        <MaterialIcon name="arrow_forward" />
      </button>
    </form>
  );
}
