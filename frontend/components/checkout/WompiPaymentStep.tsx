'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface WompiPaymentStepProps {
  onNext: () => void;
}

const PAYMENT_METHODS = [
  { icon: 'credit_card', label: 'Tarjeta de crédito o débito', desc: 'Visa, Mastercard, Amex' },
  { icon: 'account_balance', label: 'PSE', desc: 'Débito desde cualquier banco colombiano' },
  { icon: 'smartphone', label: 'Nequi', desc: 'Paga con tu billetera digital Nequi' },
  { icon: 'phone_android', label: 'Daviplata', desc: 'Paga con tu billetera digital Daviplata' },
  { icon: 'qr_code', label: 'Bancolombia QR', desc: 'Escanea y paga con la app Bancolombia' },
  { icon: 'store', label: 'Efectivo', desc: 'Paga en puntos Bancolombia Corresponsal' },
];

export function WompiPaymentStep({ onNext }: WompiPaymentStepProps) {
  return (
    <div className="space-y-6">
      {/* Encabezado Wompi */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <MaterialIcon name="account_balance_wallet" className="text-white text-xl" />
        </div>
        <div>
          <p className="font-extrabold text-primary text-sm">Pago procesado por Wompi</p>
          <p className="text-xs text-primary/50">
            Plataforma de pagos de Bancolombia — 100% segura
          </p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Seguro
          </span>
        </div>
      </div>

      {/* Métodos de pago disponibles */}
      <div>
        <p className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">
          Métodos de pago disponibles
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.label}
              className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-white"
            >
              <MaterialIcon
                name={method.icon}
                className="text-primary text-xl shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-primary leading-tight">
                  {method.label}
                </p>
                <p className="text-xs text-primary/50">{method.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info de seguridad */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <MaterialIcon name="shield" className="text-blue-500 text-xl shrink-0 mt-0.5" filled />
        <div>
          <p className="text-sm font-bold text-blue-800 mb-1">Tu información está segura</p>
          <p className="text-xs text-blue-700">
            Tus datos de pago son ingresados directamente en el entorno seguro de Wompi.
            FlexiCommerce nunca tiene acceso a tu información bancaria o de tarjeta.
          </p>
        </div>
      </div>

      {/* Botón continuar */}
      <button
        type="button"
        onClick={onNext}
        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        Continuar a Revisión
        <MaterialIcon name="arrow_forward" />
      </button>
    </div>
  );
}
