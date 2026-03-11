'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { formatCOP } from '@/lib/format';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

interface PaymentRecord {
  orderId: string;
  method: string;
  amount: number;
  status: string;
  date: string;
}

const METHOD_INFO: Record<string, { label: string; icon: string; color: string }> = {
  WOMPI:                { label: 'Wompi',               icon: 'payments',                color: 'bg-indigo-50 text-indigo-600' },
  CREDIT_CARD:          { label: 'Tarjeta de Crédito',  icon: 'credit_card',             color: 'bg-blue-50 text-blue-600' },
  DEBIT_CARD:           { label: 'Tarjeta Débito',      icon: 'credit_card',             color: 'bg-teal-50 text-teal-600' },
  PSE:                  { label: 'PSE',                  icon: 'account_balance',         color: 'bg-green-50 text-green-600' },
  NEQUI:                { label: 'Nequi',                icon: 'phone_android',           color: 'bg-purple-50 text-purple-600' },
  DAVIPLATA:            { label: 'Daviplata',            icon: 'phone_android',           color: 'bg-red-50 text-red-600' },
  BANCOLOMBIA_TRANSFER: { label: 'Bancolombia Transfer', icon: 'account_balance',         color: 'bg-yellow-50 text-yellow-700' },
  BANCOLOMBIA_COLLECT:  { label: 'Bancolombia Collect',  icon: 'account_balance',         color: 'bg-yellow-50 text-yellow-700' },
  PAYPAL:               { label: 'PayPal',               icon: 'account_balance_wallet',  color: 'bg-sky-50 text-sky-600' },
  STRIPE:               { label: 'Stripe',               icon: 'credit_card',             color: 'bg-violet-50 text-violet-600' },
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  FAILED:    { label: 'Fallido',    color: 'bg-red-100 text-red-700' },
  REFUNDED:  { label: 'Reembolsado',color: 'bg-slate-100 text-slate-700' },
};

const AVAILABLE_METHODS = [
  { key: 'CREDIT_CARD',          label: 'Tarjeta de Crédito',   icon: 'credit_card',           desc: 'Visa, Mastercard, Amex' },
  { key: 'DEBIT_CARD',           label: 'Tarjeta Débito',       icon: 'credit_card',           desc: 'Débito bancario nacional' },
  { key: 'PSE',                  label: 'PSE',                  icon: 'account_balance',       desc: 'Pago desde tu banco en línea' },
  { key: 'NEQUI',                label: 'Nequi',                icon: 'phone_android',         desc: 'Pago con billetera Nequi' },
  { key: 'DAVIPLATA',            label: 'Daviplata',            icon: 'phone_android',         desc: 'Pago con billetera Daviplata' },
  { key: 'BANCOLOMBIA_TRANSFER', label: 'Bancolombia Transferencia', icon: 'account_balance', desc: 'Transferencia desde Bancolombia' },
  { key: 'BANCOLOMBIA_COLLECT',  label: 'Corresponsal Bancolombia', icon: 'store',            desc: 'Pago en puntos corresponsales' },
];

export default function PaymentMethodsPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/orders');
      const orders: { id: string; total: number; createdAt: string; payment?: { method: string; status: string; amount: number } }[] =
        res.data?.data || res.data || [];

      const records: PaymentRecord[] = orders
        .filter((o) => o.payment)
        .map((o) => ({
          orderId: o.id,
          method: o.payment!.method,
          amount: Number(o.payment!.amount ?? o.total),
          status: o.payment!.status,
          date: new Date(o.createdAt).toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        }));

      setPaymentHistory(records);
      setTotalPaid(records.filter((r) => r.status === 'COMPLETED').reduce((s, r) => s + r.amount, 0));
    } catch {
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // Métodos únicos usados
  const usedMethods = [...new Set(paymentHistory.map((r) => r.method))];

  return (
    <div className="spacing-section">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Métodos de Pago</h1>
        <p className="text-primary/60 text-sm mt-1">Historial de pagos y métodos disponibles en FlexiCommerce</p>
      </div>

      {/* Aviso Wompi */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <MaterialIcon name="security" className="text-indigo-600 text-xl shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-indigo-800 text-sm">Pagos procesados de forma segura por Wompi</p>
          <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
            FlexiCommerce usa Wompi como pasarela de pagos certificada. No almacenamos datos de tarjetas ni credenciales bancarias.
            Cada pago es procesado directamente en los servidores seguros de Wompi con encriptación TLS.
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-primary/10 p-5">
            <p className="text-xs text-primary/40 font-medium uppercase tracking-wider mb-1">Total Pagado</p>
            <p className="text-2xl font-extrabold text-primary">{formatCOP(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-primary/10 p-5">
            <p className="text-xs text-primary/40 font-medium uppercase tracking-wider mb-1">Transacciones</p>
            <p className="text-2xl font-extrabold text-primary">{paymentHistory.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-primary/10 p-5">
            <p className="text-xs text-primary/40 font-medium uppercase tracking-wider mb-1">Métodos Usados</p>
            <p className="text-2xl font-extrabold text-primary">{usedMethods.length}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Historial de Pagos */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-primary/10 flex items-center justify-between">
              <h2 className="font-extrabold text-primary">Historial de Transacciones</h2>
              {paymentHistory.length > 0 && (
                <span className="text-xs text-primary/40 font-medium">{paymentHistory.length} registros</span>
              )}
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="size-10 rounded-lg bg-primary/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-primary/10 rounded w-40" />
                      <div className="h-2 bg-primary/5 rounded w-24" />
                    </div>
                    <div className="h-5 bg-primary/10 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="p-12 text-center">
                <MaterialIcon name="receipt_long" className="text-primary/20 text-5xl mb-3" />
                <h3 className="font-bold text-primary mb-1">Sin transacciones</h3>
                <p className="text-sm text-primary/50 mb-5">Aún no has realizado ningún pago</p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                  <MaterialIcon name="storefront" className="text-base" />
                  Explorar Productos
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {paymentHistory.map((record) => {
                  const methodInfo = METHOD_INFO[record.method] || { label: record.method, icon: 'payments', color: 'bg-primary/10 text-primary' };
                  const statusInfo = STATUS_BADGE[record.status] || { label: record.status, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <div key={record.orderId} className="flex items-center gap-4 px-5 py-4 hover:bg-primary/[0.02]">
                      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${methodInfo.color}`}>
                        <MaterialIcon name={methodInfo.icon} className="text-base" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary text-sm">{methodInfo.label}</p>
                        <p className="text-xs text-primary/40">
                          Pedido #{record.orderId.slice(0, 8)} · {record.date}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-primary text-sm">{formatCOP(record.amount)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${record.orderId}`}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-primary/5 text-primary/30 hover:text-primary transition-colors"
                        title="Ver pedido"
                      >
                        <MaterialIcon name="open_in_new" className="text-sm" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Métodos Disponibles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-primary/10">
              <h2 className="font-extrabold text-primary">Métodos Aceptados</h2>
              <p className="text-xs text-primary/40 mt-0.5">Todos disponibles al hacer tu pedido</p>
            </div>
            <div className="p-4 space-y-2">
              {AVAILABLE_METHODS.map((method) => {
                const used = usedMethods.includes(method.key);
                return (
                  <div
                    key={method.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      used
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-primary/5 hover:bg-primary/[0.02]'
                    }`}
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                      (METHOD_INFO[method.key]?.color) || 'bg-primary/10 text-primary'
                    }`}>
                      <MaterialIcon name={method.icon} className="text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary text-xs">{method.label}</p>
                      <p className="text-[10px] text-primary/40">{method.desc}</p>
                    </div>
                    {used && (
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                        Usado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 bg-primary rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <MaterialIcon name="lock" className="text-yellow-300 text-xl" />
              <p className="font-bold">Pagos 100% Seguros</p>
            </div>
            <p className="text-sm text-white/70 mb-4">
              Todos los pagos están protegidos por cifrado SSL y procesados por Wompi, certificado PCI DSS Nivel 1.
            </p>
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 bg-white text-primary font-bold py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm"
            >
              <MaterialIcon name="shopping_cart" className="text-base" />
              Ir a Comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
